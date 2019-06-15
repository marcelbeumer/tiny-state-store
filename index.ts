export interface State {
  [index: string]: any;
}

export interface Store<T extends State, U = Partial<T>> {
  getState(): T;
  setState(update: U): void;
}

export type HasChanged = boolean;
export type MergeFn<T extends State, U = Partial<T>> = (a: T, b: U) => [T, HasChanged];
export type OnChangeFn<T extends State> = (state: T, prevState: T) => void;

export function shallowMerge<T extends State>(a: T, b: Partial<T>): [T, HasChanged] {
  const changed = Object.keys(b).some(name => a[name] !== b[name]);
  return [changed ? { ...a, ...b } : a, changed];
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
      const [newState, hasChanged] = merge(state, update);
      state = newState;
      if (hasChanged && onChange) onChange(newState, prevState);
    }
  };
};

export default createStore;
