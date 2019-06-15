# tiny-state-store [![Build status](https://travis-ci.org/marcelbeumer/tiny-state-store.svg?branch=master)](https://travis-ci.org/marcelbeumer/tiny-state-store) [![NPM version](https://flat.badgen.net/npm/v/tiny-state-store/latest)](https://www.npmjs.com/package/tiny-state-store) [![Bundle size](https://badgen.net/bundlephobia/minzip/tiny-state-store)](https://bundlephobia.com/result?p=tiny-state-store)

Small and super simple general purpose state store. Runs in node and the browser, written in TypeScript.

## Installation

```
npm i tiny-state-store
```

## Getting started

```ts
import createStore from 'tiny-state-store';

interface AppState {
  loaded: boolean;
  title: string | null
}

const initialState: AppState = {
  loaded: false,
  title: null
};

const store = createStore<AppState>(initialState);

store.setState({ title: 'my stateful app' });
console.log(store.getState());
```

## API

#### `createStore<State>(initialState: State, options?: StoreOptions): Store<State>`

Creates new store with initial state. Optionally takes options object allowing to set:

- `mergeFn: (a: State, b: Partial<State>): State`. Can be used to override the merge function used when setting state to do something else than a simple shallow copy.

#### `store.getState(): ReadonlyDeep<State>`

Returns current state as (deep) read only object. WARNING: returned object is the actual current state object, immutability is only enforced with TypeScript.


#### `store.setState(update: Partial<State>): void`

Sets partial state update. Per default the store creates a new state object for each state updat, spreading in both the current state and the update like so:
`(a, b) => ({ ...a, ...b})`. It's possible to pass a custom merge function to `createStore` to implement deep copying or special behavior.