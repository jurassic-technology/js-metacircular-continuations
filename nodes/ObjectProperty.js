import Node from './Node'

export default class ObjectProperty extends Node {
  constructor (key, value, computed) {
    super()
    this.type = 'ObjectProperty'
    this.key = key
    this.value = value
    this.computed = computed
    this.TRAVERSAL_ROUTE = [ 'key', 'value' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var obj = new Object()
    var propKey

    if (this.computed) {
      return this.key.interpret(scope, nextContKey, prevErrCont)
    } else {
      return nextContKey(this.key.name)
    }

    function nextContKey (key) {
      propKey = key
      return self.value.interpret(scope, nextContValue, prevErrCont)
    }

    function nextContValue (value) {
      obj[propKey] = value
      return prevCont(obj)
    }

  }

  toAST() {
    var key = this.key.toAST()
    var value = this.value.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      key: key,
      value: value
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var key = this.key.toNativeSource()
    var value = this.value.toNativeSource()
    this.nativeSource = key + ': ' + value
  }
}
