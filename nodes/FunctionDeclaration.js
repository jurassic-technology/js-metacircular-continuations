import Node from './Node'

export default class FunctionDeclaration extends Node {
  constructor (id, params, body) {
    super()
    this.type = 'FunctionDeclaration'
    this.id = id
    this.params = params.length ? params : []
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'id', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var newScope = scope.newAsyncScope(this.body)

    var params = [ ]
    if (this.params.length) {
      for (var i = 0; i < this.params.length; i++) {
        params.push(this.params[i].name)
      }
    }

    newScope.setParameters(params)

    scope.declare(this.id.name, newScope)

    return prevCont(newScope)

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
    var id = this.id.toAST()

    var params = []
    for (var i = 0; i < this.params.length; i++){
      params.push(this.params[i].toAST())
    }

    var body = this.body.toAST()
    return {
      type: this.type,
      id: id,
      params: params,
      body: body,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource();
    return this.nativeSource
  }

  setNativeSource () {
    var id = this.id.toNativeSource()
    var params = ''
    for (var i = 0; i < this.params.length; i++){
      params += this.params[i].toNativeSource()
      if (i !== this.params.length){
        params += ','
      }
    }
    var body = this.body.toNativeSource()
    this.nativeSource = 'function ' + id + ' (' + params + ') ' + body
  }
}


