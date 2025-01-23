export type ObservableUtils<T> = {
    onChange(handler: (value: T) => void): void;
    getPath(): string[];
    get(): T;
    set(value: T | null): void;
};
export type RecursiveState<T> = {
    [K in keyof T]: StateNode<T[K]>;
};
export type StateNode<T> = RecursiveState<T> & ObservableUtils<T>;
export declare function StateFarm<T extends any>(startValue: T): StateNode<T>;
//# sourceMappingURL=StateFarm.d.ts.map