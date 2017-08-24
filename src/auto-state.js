
'use strict'

const mutationOptions = { attributes: 1, childList: 1, subtree: 1 }

class AutoState extends HTMLElement {
  constructor() {
    super()

    this._setAuto({}, {}, {})
  }


  get dispatch() { return this.auto.dispatch }

  get commit() { return this.auto.commit }

  get state() { return this.auto.state }

  get auto() { return this._auto }


  _setAuto(dispatch, commit, state) {
    dispatch = Object.freeze(dispatch)
    commit = Object.freeze(commit)
    state = Object.freeze(state)
    this._auto = Object.freeze({ dispatch, commit, state })
  }


  _injectAuto(children, recursive) {
    for (const child of children) {
      if (child.nodeType != Node.ELEMENT_NODE) continue
      
      child.auto = this.auto
      if (recursive) this._injectAuto(child.children)
    }
  }


  _domObserve(domMutations) {
    console.log('dom mutations', domMutations)
    for (mut of domMutations) {
      if (mut.type === 'childList') {

        // iterate over addedNodes and add dispatch
        // iterate over removedNodes and remove dispatch

      }
    }
  }

  connectedCallback() {
    console.log('connectedCallback()', this.childNodes)
    new MutationObserver(this._domObserve).observe(this, mutationOptions)

    this._injectAuto(this.children, 'recursive')
  }



  init(actions, mutations, initialState) {
    const isFunction = f => 'function' === typeof f
    const isNamedFunction = f => isFunction(f) && f.name
    const check = (funcs) => {
      // funcs = [ function f() { ... }, ]
      if (Array.isArray(funcs) && funcs.every(isNamedFunction)) {
        const funcsObject = {}
        for (const func of funcs) funcsObject[func.name] = func
        return funcsObject
      }
  
      // funcs = function() { ... }
      if (isNamedFunction(funcs)) return { [funcs.name]: funcs }
      
      // funcs = { f() { ... }, ... }
      if (Object.values(funcs).every(isFunction)) return funcs
  
      throw new TypeError('Invalid parameter. Expected:'
        + ' a named function,'
        + ' an array of named functions, or'
        + ' an object with function valies.')
    }
  
    this._setAuto(check(actions), check(mutations), initialState)
    this._injectAuto(this.children, 'recursive')

    // TODO on re-init clean up if necessary
  }
}


window.customElements.define('auto-state', AutoState)
