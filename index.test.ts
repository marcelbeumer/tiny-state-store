import { assert } from 'chai';
import sinon from 'sinon';
import createStore, { MergeFn, shallowMerge } from '.';
import { Test } from 'mocha';

interface TestState {
  title: string | null;
  duration: number | null;
  metadata: {
    [index: string]: any;
  };
}

const createInitialState = (): TestState => ({
  title: null,
  duration: null,
  metadata: {}
});

describe('creating a store', () => {
  it('supports passing custom merge fn', () => {
    const onChange = sinon.spy();
    const mergeFn: MergeFn<TestState> = (a, b) => [{ ...a, ...b, duration: 999 }, true];
    const store = createStore<TestState>(createInitialState(), onChange, mergeFn);
    store.setState({ title: 'hello' });
    assert.strictEqual(onChange.callCount, 1);
    assert.deepEqual(store.getState(), {
      ...createInitialState(),
      title: 'hello',
      duration: 999
    });
  });

  it('custom merge fn does not trigger onChange when returning false', () => {
    const onChange = sinon.spy();
    const mergeFn: MergeFn<TestState> = (a, b) => [{ ...a, ...b, duration: 999 }, false];
    const store = createStore<TestState>(createInitialState(), onChange, mergeFn);
    store.setState({ title: 'hello' });
    assert.strictEqual(onChange.callCount, 0);
  });

  it('allows customizing the update shape typing', () => {
    let lastUpdateId: string | undefined = undefined;
    const onChange = sinon.spy();
    type StateUpdate = Partial<TestState> & { __updateId: string };
    const mergeFn: MergeFn<TestState, StateUpdate> = (a, b) => {
      lastUpdateId = b.__updateId;
      return shallowMerge(a, b);
    };
    const store = createStore<TestState, StateUpdate>(createInitialState(), onChange, mergeFn);
    store.setState({ __updateId: 'id', title: 'hello' });

    assert.equal(lastUpdateId, 'id');
  });
});

describe('getState', () => {
  it('returns reference to current state object (no copy)', () => {
    const store = createStore<TestState>(createInitialState());
    const stateA = store.getState();
    const stateB = store.getState();
    assert.equal(stateA, stateB);
  });
});

describe('setState', () => {
  it('does not create a new state object when not changing state', () => {
    const store = createStore<TestState>(createInitialState());
    const stateA = store.getState();
    store.setState({});
    const stateB = store.getState();
    assert.equal(stateA, stateB);
  });

  it('creates a new state object when changing state', () => {
    const store = createStore<TestState>(createInitialState());
    const stateA = store.getState();
    store.setState({ title: 'new' });
    const stateB = store.getState();
    assert.notEqual(stateA, stateB);
  });

  it('makes a shallow copy', () => {
    const store = createStore<TestState>(createInitialState());
    store.setState({ duration: 100, metadata: { author: 'foo' } });
    const stateA = store.getState();
    store.setState({ duration: 100, metadata: { author: 'foo' } });
    const stateB = store.getState();

    assert.notEqual(stateA, stateB);
    assert.deepEqual(stateA, stateB);
    assert.notEqual(stateA.metadata, stateB.metadata);
  });

  it('calls onChange when state changed', () => {
    const onChange = sinon.spy();
    const store = createStore<TestState>(createInitialState(), onChange);
    const stateA = store.getState();
    store.setState({ title: 'new' });
    const stateB = store.getState();

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.lastCall.args, [stateB, stateA]);
  });

  it('calls onChange when state because of deep object inequality', () => {
    const onChange = sinon.spy();
    const store = createStore<TestState>(createInitialState(), onChange);
    const stateA = store.getState();
    const metadata = store.getState().metadata;
    store.setState({ metadata: { ...metadata } });
    const stateB = store.getState();

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(stateB, stateA);
    assert.deepEqual(onChange.lastCall.args, [stateB, stateA]);
  });

  it('does not call onChange because of deep object modifications', () => {
    const onChange = sinon.spy();
    const store = createStore<TestState>(createInitialState(), onChange);
    const stateA = store.getState();
    const metadata = store.getState().metadata;
    (metadata.foo as any) = '10';
    store.setState({ metadata });
    const stateB = store.getState();

    assert.equal(onChange.callCount, 0);
    assert.deepEqual(stateB, stateA);
  });

  it('does not call onChange when did not change', () => {
    const onChange = sinon.spy();
    const store = createStore<TestState>(createInitialState(), onChange);
    store.setState({});
    store.setState({ title: store.getState().title });
    assert.equal(onChange.callCount, 0);
  });
});
