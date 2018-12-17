import Node from './Node' 

export default class Identifier extends Node {
  constructor (name) {
    super()
    this.type = 'Identifier'
    this.name = name
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var value

    if (this.name == 'undefined') {
      return resolveValue(undefined, prevCont, prevErrCont)
    } else if (this.name == 'eval') {
    // TODO: What is happening here?
      return this.eval
    } else {
      if (scope.has(this.name)){
        value = scope.get(this.name)
        return resolveValue(value, prevCont, prevErrCont)
      } else {
        // return prevCont(undefined)
        var err = new ReferenceError(this.name + ' is not declared.')
        return prevErrCont('ReferenceError', err)
      }

    }

  }

  toAST() {
    return {
      type: this.type,
      name: this.name,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + this.name + ')'
    else
      this.nativeSource = this.name
  }
}

