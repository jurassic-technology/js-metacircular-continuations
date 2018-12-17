import Node from './Node' 

export default class CatchClause extends Node {

  constructor (param, body) {
    super()
    this.type = 'CatchClause'
    this.param = param
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'param', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {
    return this.body.interpret(scope, prevCont, prevErrCont)
  }

  prependChild (node) {
    this.body.body.unshift(node)
  }

  appendChild (node) {
    this.body.body.push(node)
  }

  removeChild (node) {
    var childIndex = this.body.body.indexOf(node)
    if (childIndex >= 0) this.body.body.splice(childIndex, 1)
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.body.indexOf(target)
    if (childIndex >= 0) this.body.body.splice(childIndex, 1, replacement)
  }

  toAST() {
    var param = this.param.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      param: param,
      body: body,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var param = this.param.toNativeSource()
    var body = this.body.toNativeSource()
    this.nativeSource =  'catch (' + param + ') ' + body
  }
}

