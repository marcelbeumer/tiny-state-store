export interface State {
  [index: string]: any;
}

export interface Store<T extends State, U = Partial<T>> {
  getState(): T;
  setState(update: U): void;
}

export type MergeFn<T extends State, U = Partial<T>> = (a: T, b: U) => T;
export type OnChangeFn<T extends State> = (state: T, prevState: T) => void;

export function shallowMerge<T extends State>(a: T, b: Partial<T>): T {
  const changed = Object.keys(b).some(name => a[name] !== b[name]);
  return changed ? { ...a, ...b } : a;
}

const createStore = <T extends State, U = Partial<T>>(
  initialState: T,
  onChange?: OnChangeFn<T> | null,
  mergeFn?: MergeFn<T, U> | null
): Store<T, U> => {
  let state: T = initialState;
  const merge: MergeFn<T, U> = mergeFn || ((a, b) => shallowMerge<T>(a, b));
  return {
    getState: () => state,
    setState(update) {
      const prevState = state;
      state = merge(state, update);
      if (state !== prevState && onChange) onChange(state, prevState);
    }
  };
};

export default createStore;
