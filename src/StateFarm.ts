type Listener = (value: any) => void;

class StateTree {
  private listeners: Map<string, Listener[]> = new Map();
  private value: any;
  
  constructor(initialValue: any) {
    this.value = initialValue;
  }

  getValue(path: string[]) {
    let current = this.value;
    for (const key of path) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  setValue(path: string[], newValue: any) {
    if (path.length === 0) {
      this.value = newValue;
      this.notifyListeners(path);
      // Notify all child listeners when root is updated
      this.notifyChildListeners(path);
      return;
    }

    let current = this.value;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey] = newValue;
    
    // Notify listeners starting from the deepest path up to root
    for (let i = path.length; i >= 0; i--) {
      this.notifyListeners(path.slice(0, i));
    }

    // Always notify child listeners, regardless of new value type
    this.notifyChildListeners(path);
  }

  private notifyChildListeners(parentPath: string[]) {
    // Get all listener paths that start with the parent path
    for (const [listenerPath, listeners] of this.listeners.entries()) {
      const pathArray = listenerPath.split('.');
      
      // Check if this is a child path of the parent
      if (this.isChildPath(parentPath, pathArray)) {
        // Get the value for this specific child path
        const value = this.getValue(pathArray);
        listeners.forEach(listener => listener(value));
      }
    }
  }

  private isChildPath(parentPath: string[], childPath: string[]): boolean {
    if (parentPath.length >= childPath.length) return false;
    return parentPath.every((segment, index) => segment === childPath[index]);
  }

  addListener(path: string[], listener: Listener) {
    const pathKey = path.join('.');
    if (!this.listeners.has(pathKey)) {
      this.listeners.set(pathKey, []);
    }
    this.listeners.get(pathKey)!.push(listener);
  }

  private notifyListeners(path: string[]) {
    const pathKey = path.join('.');
    const value = this.getValue(path);
    
    // Get listeners for this exact path
    const listeners = this.listeners.get(pathKey) || [];
    listeners.forEach(listener => listener(value));
  }
}

export type ObservableUtils<T> = {
  onChange(handler: (value: T) => void): void;
  getPath(): string[];
  get(): T;
  set(value: T | null): void;
};

export type RecursiveState<T> = {
  [K in keyof T]: StateNode<T[K]>;
}

export type StateNode<T> = RecursiveState<T> & ObservableUtils<T>;

export function StateFarm<T extends any>(startValue: T): StateNode<T> {
  const stateTree = new StateTree(startValue);

  function createProxy<V>(path: string[] = []): any {
    const tools: ObservableUtils<V> = {
      getPath() {
        return path;
      },
      get() {
        return stateTree.getValue(path);
      },
      set(value: V) {
        stateTree.setValue(path, value);
      },
      onChange(handler: (value: V) => void) {
        stateTree.addListener(path, handler);
      }
    };

    const handler = {
      get(_: any, prop: string | symbol) {
        if (typeof prop === 'string' && prop in tools) {
          return tools[prop as keyof typeof tools];
        }
        return createProxy([...path, prop.toString()]);
      }
    };

    return new Proxy({}, handler);
  }

  return createProxy<T>();
}
