## \<auto-store>: a web component with Flux-style reactive state management

The state managed by \<auto-store> is a **view state**. This is an abstraction of the view as naked data. It should only contain data immediately needed by and adapted for the view. As seen in the MVVM pattern this is the view-model. Additionally \<auto-store> adopts a **Flux-style data flow** with an idea taken from **Vuex**: commiting mutations.

```
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        :                                                             :
        :                                                             :
        :       dispatch         +----------+        commit           V
        +----------------------->|  Action  |-------------------------+
        |    (asynchronously)    +----------+     (synchronously)     |
        |                                                             |
        |                                                             V
  +-----------+                                                +------------+
  |  Element  |                                                |  Mutation  |
  +-----------+                                                +------------+
        ^                                                             |
        |       render by         +---------+     update by direct    |
        +-------------------------|  State  |<------------------------+
            dependency callback   +---------+    assigning to store
```

Let me concretise this in a small example: a login button of a single page application:

1. The login button click handler invokes `dispatch.login()`, i. e. the element **dispatches** the action `login()`.
1. An action is an **asynchronous** function. Some time later, like after a successful network request, it wants to update the login name. It invokes a mutation `commit.setName(name)`, i. e. the action **commits** the mutation `setName()` to the store.
1. The `setName()` mutation is **synchronous**. It **updates** the state immediately
by assigning like this: `state.name = name`. This is the only place where the
state in the store is allowed to be mutated.
1. All dependencies on `state.name` get run. These dependencies modify the
elements showing the name, in other words, they render the element.

For this data flow to work reliably, some rules must be held:

- Do not modify state directly.
- Initialise \<auto-store> as early as possible.
- Elements are reactively rendered only after `addDependency()`.
- Avoid to dispatch actions or to commit mutations inside dependencies. This can lead to infinite loops. It is fine to commit mutations directly from elements shown by the dotted line at the top of the diagram.

An important difference to Flux, Vuex and other state management implementations is that actions and mutations aren't dispatched or committed identified by a string parameter, like this: `dispatch('login')`, but **directly by a function**, like this: `dispatch.login()`.

Please have a look at `example-simple.html` and `example-deep.html`.

## API

\<auto-store> is a container element which manages state for its child elements. Binding by attributes or markup is not provided (do one thing well). Other web components shall provide declarative binding.

The state management is initialised with `auto.init({ actions, mutations, state })`:

- `actions` and `mutations` are objects with non-arrow functions as values. An action is an asynchronous function which commits mutations by invoking on the `this` object. Exceptions in actions are caught and pushed to `state.actionErrors`. A mutation is a synchronous function which writes directly to the state tree in the `this` object. This is the only allowed place where one change the state. This is enforced if the state-readonly
attribute \<auto-store> is set.
- `initial` is the initial state tree for \<auto-store>. 

All children of \<auto-store> get a read-only JavaScript property `store` (or a different name if set with \<auto-store store-name=name>) with these sub-properties:

- `dispatch` for all available actions;
- `commit` for all available mutations;
- `state` for the state tree; and
- `addDependency(path, callback)` to register a dependency on state change.

In an event handler invoke `event.target.store.dispatch.login()` or `event.target.store.commit.setName(name)`, for example. To receive store updates, invoke `input.store.addDependency('name', val => input.value = val)`, for example.

## Todos

This web component is **not yet even alpha** and in a **very early state of implementation**. Todos:

1. Implement dependency callback with observe tree
1. Inject dynamically added elements
1. Expand and style the example
1. Write tests
1. Provide a second, more complex example
1. Implement store-readonly
