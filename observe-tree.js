//@flow

function throwTypeError(what) {
  throw new TypeError(what + ' disallowed by observe-tree.js')
}


// Is primitive? https://stackoverflow.com/a/31538091
function isPrimitive(value) {
  return value !== Object(value)
}


// Allowed: null, primitives, objects of class Object, Array, Date.
// Date. Return false if allowed or a string telling what is disallowed.
// Wrapped primitives aren't allowed because you can add properties to
// them and this complicates observing the tree. Objects of other classes
// aren't allowed because the state tree is just an object graph. To use
// other classes, do Object.assign({}, object) first.
function disallowedValue(value) {
  if ('undefined' === typeof value) return 'undefined'
  if (null === value) return ''

  if (isPrimitive(value)) return ''

  if ([ String, Number, Boolean, Symbol ].includes(value.constructor))
    return 'wrapped ' + value.constructor.name.toLowerCase()
  
  if (![Object, Array, Date].includes(value.constructor))
    return 'object of class ' + value.constructor.name

  return ''
}


/*::
  type PlainObject = { [string]: mixed }
  type ChangeRecord = { 
       type: 'create' | 'replace' | 'delete', 
       path: string, 
       newValue?: mixed, 
       oldValue?: mixed 
     }
*/


export function observeTree(
  obj        /*: PlainObject */, 
  callback   /*: (ChangeRecord) => void */, 
  prefixPath /*: string */ = '',
) {
  const observeHandler = {
    setPrototypeOf() {
      throwTypeError('setting prototype') 
    },

    defineProperty() { 
      throwTypeError('defining property')
    },

    set(target, property, value) {
      const disallowed = disallowedValue(value)
      if (disallowed) throwTypeError('setting ' + disallowed)

      const path = prefixPath + '.' + property
      if (!isPrimitive(value)) value = observeTree(value, callback, path)
      
      const change = { type: 'create', path, newValue: value }
      if (property in target) Object.assign(change, 
        { type: 'replace', oldValue: target[property] })
      callback(change)
      target[property] = value

      return true
    },

    deleteProperty(target, property) {
      const path = prefixPath + '.' + property
      callback({ type: 'delete', path, oldValue: target[property] })
      delete target[property]

      return true
    },
  }
  
  return new Proxy(obj, 
    //$FlowFixMe
    observeHandler)
}
