## <auto-state>: a web component with Flux-style reactive state management

The state managed by <auto-state> is a **view state**. This is an abstraction of the view as naked data. It should only contain data immediately needed by and adapted for the view. As seen in the MVVM pattern this is the view-model. Additionally <auto-state> adopts a **Flux-style data flow**. Let me show this in a small example: a login button of a single page application:

1. The login button click handler invokes `auto.dispatch.login()`, i. e. the element **dispatches** the action `login()`.
1. An action is an **asynchronous** function. Some time later, like after a successful network request, it wants to update the login name. It invokes a mutation `auto.commit.setName(name)`, i. e. the action **commits** the mutation `setName()` to the state.
1. The `setName()` mutation is **synchronous**. It **updates** the state immediately.
1. All dependencies on `auto.state.name` get run and update the elements displaying this part of the state.

For this data flow to work reliably, some rules must be held:

- Do not modify state directly.
- Initialise <auto-state> as early as possible.
- Elements are reactively updated only after `addDependency()`.
- Avoid to dispatch actions or to commit mutations inside dependencies. This can lead to infinite loops.

It is fine to commit mutations directly from event handlers.

An important difference to Flux and other state management implementations is that actions and mutations aren't dispatched or committed identified by a string parameter, like this: `dispatch('login')`, but **directly by a function**, like this: `dispatch.login()`.

The <auto-state> only does binding and two-way binding by JavaScript code. To reduce boiler-plate use the <auto-binder> web component (planned).

## API

<auto-state> is a container element which manages state for its child elements. The state management is initialised with `init(actions, mutations, initialState)`:

- `actions` and `mutations` are named function collections (i. e. an object with functions as values or an array of named functions). An action is an asynchronous function which commits mutations by invoking it on the `this` object. Exceptions in actions are caught and pushed to `state.actionErrors`. A mutation is a synchronous function which writes directly to the state tree in the `this` object. This is the only allowed write access to the state (not enforced yet).
- `initialState` is the initial state tree for <auto-state>. 

All children of <auto-state> get a read-only JavaScript property `auto` with these sub-properties:

- `auto.dispatch` for all available actions;
- `auto.commit` for all available mutations;
- `auto.state` for the state tree; and
- `auto.addDependency(path, callback)` to register a state dependency.

In an event handler invoke `event.target.auto.dispatch.login()` or `event.target.auto.commit.setName(name)`, for example. To receive state updates, invoke `input.auto.addDependency('name', val => input.value = val)`, for example.

## Todos

This web component is **not yet even alpha** and in a **very early state of implementation**. Todos:

1. Wrap the actions and mutations
1. Implement addDependency
1. Inject dynamically added elements
1. Expand and style the example
1. Write tests
1. Provide a second, more complex example
