export interface State {
  [index: string]: any;
}

export interface Store<T extends State, U = Partial<T>> {
  getState(): T;
  update(update: U): void;
  subscribe(listener: Listener<T>): void;
  unsubscribe(listener: Listener<T>): void;
  setReducer(reducer: Reducer<T, U>): void;
  getReducer(): Reducer<T, U>;
}

export type Reducer<T extends State, U = Partial<T>> = (a: T, b: U) => T;
export type Listener<T extends State> = (state: T, prevState: T) => void;

export function shallowMerge<T extends State>(a: T, b: Partial<T>): T {
  const changed = Object.keys(b).some(name => a[name] !== b[name]);
  return changed ? { ...a, ...b } : a;
}

const createStore = <T extends State, U = Partial<T>>(
  initialState: T,
  listener?: Listener<T> | null,
  reducer?: Reducer<T, U> | null
): Store<T, U> => {
  let state: T = initialState;
  const listeners: Listener<T>[] = [];
  let reduce: Reducer<T, U> = reducer || ((a, b) => shallowMerge<T>(a, b));
  if (listener) listeners.push(listener);
  return {
    getState: () => state,
    update(update) {
      const prevState = state;
      state = reduce(state, update);
      if (state !== prevState) {
        listeners.forEach(handler => handler(state, prevState));
      }
    },
    getReducer() {
      return reduce;
    },
    setReducer(reducer) {
      reduce = reducer;
    },
    subscribe(listener) {
      listeners.push(listener);
    },
    unsubscribe(listener) {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  };
};

export default createStore;
