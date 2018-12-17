import Node from './Node' 
import FunctionExpression from './FunctionExpression'

export default class ObjectMethod extends Node {

  constructor (kind, key, params, body) {
    super()
    this.type = 'ObjectMethod'
    this.key = key
    this.kind = kind
    this.params = params
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'key', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var method = new FunctionExpression(null, self.params, self.body)
    var methodScope = scope.newAsyncScope(method)
    return prevCont(methodScope)

  }

  toAST() {
    var key = this.key.toAST()
    var params = [ ]
    for (var i = 0; i < this.params.length; i++) params.push(this.params[i].toAST())
    var body = this.body.toAST()
    return {
      key: key,
      params: params,
      body: body,
      kind: this.kind
    }

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var key = this.key.toNativeSource()
    var params = ''
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].toNativeSource()
      if (i !== this.params.length) {
        params += ', '
      }
    }
    var body = this.body.toNativeSource()
    this.nativeSource = this.kind + key + ' (' + params + ') ' + body
  }
}

