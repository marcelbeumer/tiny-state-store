# tiny-state-store [![Build status](https://travis-ci.org/marcelbeumer/tiny-state-store.svg?branch=master)](https://travis-ci.org/marcelbeumer/tiny-state-store) [![NPM version](https://flat.badgen.net/npm/v/tiny-state-store/latest)](https://www.npmjs.com/package/tiny-state-store) [![Bundle size](https://badgen.net/bundlephobia/minzip/tiny-state-store)](https://bundlephobia.com/result?p=tiny-state-store)

Small and super simple general purpose state store. Runs in node and the browser, written in TypeScript. 

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Reacting on state changes](#reacting-on-state-changes)
- [Example merge fn: special update data structure](#example-merge-fn-special-update-data-structure)
- [Example merge fn: deep merging updates](#example-merge-fn-deep-merging-updates)
- [API reference](#api-reference)

## Installation

```
npm i tiny-state-store
```

## Basic usage

The basics of the lib are `getState` and `setState`. By default `setState` will do a shallow merge of the current state and the state update. In case you need a different merge strategy you can write a [custom merge function](#example-merge-fn-deep-merging-updates).

```ts
import createStore from 'tiny-state-store';

type AppState = { loaded: boolean; title: string | null; };

const initialState: AppState = { loaded: false, title: null };
const store = createStore<AppState>(initialState);

store.setState({ title: 'my stateful app' });
console.log(store.getState());
```

## Reacting on state changes

You can pass an onChange handler that will get called whenever the state object changes. State change is determined by a single `===` check on the root state object.

```ts
import createStore, { OnChangeFn } from 'tiny-state-store';

type AppState = { loaded: boolean; title: string | null; };

const initialState: AppState = { loaded: false, title: null };
const onChange: OnChangeFn<AppState> = (state, prevState) => {
  console.log('state changed:', state, prevState);
}
const store = createStore<AppState>(initialState, onChange);

store.setState({ title: 'my stateful app' });
```

## Example merge fn: special update data structure

By default `setState` takes partial state updates, but by you can customize what structures `setState` understands by using a custom merge function:

```ts
import createStore, { shallowMerge, MergeFn } from 'tiny-state-store';

type AppState = { loaded: boolean };
type AppStateUpdate = Partial<AppState> & { __special?: 'foo' | 'bar' };

const mergeFn: MergeFn<AppState, AppStateUpdate> = (a, b) => {
  if (b.__special === 'foo') {
    // ...do something special
    return a
  }
  return shallowMerge(a, b);
};
const initialState: AppState = { loaded: false };
const store = createStore<AppState, AppStateUpdate>(initialState, null, mergeFn);

store.setState({ __special: 'foo', loaded: true });
```

## Example merge fn: deep merging updates

By default the lib only does a shallow copy of the state updates, because implementing deep merge requires to make choices that are best made on application level. Example:

```ts
import createStore, { MergeFn, State } from 'tiny-state-store';
import { DeepPartial } from 'ts-essentials';

type AppState = {
  loaded: boolean;
  metadata: {
    title: string | null;
    author: string | null;
  };
};

const initialState: AppState = {
  loaded: false,
  metadata: {
    title: null,
    author: null
  }
};

export const shallowChanged = (a: State, b: State) =>
  Object.keys(b).some(name => a[name] !== b[name]);

const mergeFn: MergeFn<AppState, DeepPartial<AppState>> = (a, b) => {
  const changed = shallowChanged(a, b) || shallowChanged(a.metadata, b.metadata || {});
  if (!changed) return a;
  return { ...a, ...b, metadata: { ...a.metadata, ...b.metadata } };
};

const store = createStore<AppState, DeepPartial<AppState>>(initialState, null, mergeFn);

store.setState({ metadata: { title: 'my stateful app' } });
```

## API reference

#### `createStore<State, StateUpdate = Partial<State>>(initialState: State, onChange?: OnChangeFn<State>, mergeFn?: MergeFn<State, StateUpdate>): Store<State>`

Creates new store with initial state. Takes optional parameters:

- `onChange?: (state: State, prevState: State) => void`: function called when the state object changed 
- `mergeFn?: (a: State, b: StateUpdate): State`. Can be used to override the default shallow merge function. When the returned state object does not equal the current object (`===`) onChange will be triggered.

#### `store.getState(): State`

Returns current state. WARNING: returned object is the actual current state object, immutability is not enforced.

#### `store.setState(update: StateUpdate): void`

Sets partial state update and triggers "onChange" determined by a single `===` check on the root state object.