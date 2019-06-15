import { ReadonlyDeep } from 'type-fest';

export interface Store<State> {
  getState(): ReadonlyDeep<State>;
  setState(update: Partial<State>): void;
}

export type MergeFn<State> = (a: State, b: Partial<State>) => State;

export interface StoreOptions<State> {
  mergeFn?: MergeFn<State>;
}

const createStore = <State>(initialState: State, options?: StoreOptions<State>): Store<State> => {
  let state: State = initialState;
  const merge: MergeFn<State> = (options && options.mergeFn) || ((a, b) => ({ ...a, ...b }));
  return {
    getState: () => state as ReadonlyDeep<State>,
    setState(update) {
      state = merge(state, update);
    }
  };
};

export default createStore;
