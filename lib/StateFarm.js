"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateFarm = void 0;
class StateTree {
    constructor(initialValue) {
        this.listeners = new Map();
        this.value = initialValue;
    }
    getValue(path) {
        let current = this.value;
        for (const key of path) {
            if (current === null || current === undefined) {
                return undefined;
            }
            if (key in current) {
                current = current[key];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    setValue(path, newValue) {
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
    notifyChildListeners(parentPath) {
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
    isChildPath(parentPath, childPath) {
        if (parentPath.length >= childPath.length)
            return false;
        return parentPath.every((segment, index) => segment === childPath[index]);
    }
    addListener(path, listener) {
        const pathKey = path.join('.');
        if (!this.listeners.has(pathKey)) {
            this.listeners.set(pathKey, []);
        }
        this.listeners.get(pathKey).push(listener);
    }
    notifyListeners(path) {
        const pathKey = path.join('.');
        const value = this.getValue(path);
        // Get listeners for this exact path
        const listeners = this.listeners.get(pathKey) || [];
        listeners.forEach(listener => listener(value));
    }
}
function StateFarm(startValue) {
    const stateTree = new StateTree(startValue);
    function createProxy(path = []) {
        const tools = {
            getPath() {
                return path;
            },
            get() {
                return stateTree.getValue(path);
            },
            set(value) {
                stateTree.setValue(path, value);
            },
            onChange(handler) {
                stateTree.addListener(path, handler);
            }
        };
        const handler = {
            get(_, prop) {
                if (typeof prop === 'string' && prop in tools) {
                    return tools[prop];
                }
                return createProxy([...path, prop.toString()]);
            }
        };
        return new Proxy({}, handler);
    }
    return createProxy();
}
exports.StateFarm = StateFarm;
//# sourceMappingURL=StateFarm.js.map