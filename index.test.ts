import { assert } from 'chai';
import { JsonObject } from 'type-fest';
import createStore, { MergeFn } from '.';

interface TestState {
  title: string | null;
  duration: number | null;
  metadata: JsonObject;
}

const createInitialState = (): TestState => ({
  title: null,
  duration: null,
  metadata: {}
});

it('getState returns reference to current state object (no copy)', () => {
  const store = createStore<TestState>(createInitialState());
  const stateA = store.getState();
  const stateB = store.getState();
  assert.equal(stateA, stateB);
});

it('setState creates a new object', () => {
  const store = createStore<TestState>(createInitialState());
  const stateA = store.getState();
  store.setState({});
  const stateB = store.getState();
  assert.notEqual(stateA, stateB);
});

it('setState makes a shallow copy', () => {
  const store = createStore<TestState>(createInitialState());
  store.setState({ duration: 100, metadata: { author: 'foo' } });
  const stateA = store.getState();
  store.setState({ duration: 100, metadata: { author: 'foo' } });
  const stateB = store.getState();

  assert.notEqual(stateA, stateB);
  assert.deepEqual(stateA, stateB);
  assert.notEqual(stateA.metadata, stateB.metadata);
});

it('supports passing custom merge fn', () => {
  const mergeFn: MergeFn<TestState> = (a, b) => ({ ...a, ...b, duration: 999 });
  const store = createStore<TestState>(createInitialState(), { mergeFn: mergeFn });
  store.setState({ title: 'hello' });
  assert.deepEqual(store.getState(), {
    ...createInitialState(),
    title: 'hello',
    duration: 999
  });
});
