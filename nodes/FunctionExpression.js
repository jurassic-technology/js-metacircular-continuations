import Node from './Node' 

export default class FunctionExpression extends Node {
  constructor (id, params, body) {
    super()
    this.type = 'FunctionExpression'
    this.id = id
    this.params = params
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'id', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var newScope = new AsyncScope(this.body, scope)

    var params = [ ]
    if (this.params.length) {
      for (var i = 0; i < this.params.length; i++) {
        params.push(this.params[i].name)
      }
    }
    newScope.setParameters(params)

    if (this.id) {
      newScope.declare(this.id.name, newScope)
    }

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
    var id = this.id ? this.id.toAST() : undefined
    var params = []
    for (var i = 0; i < this.params.length; i++) {
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
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var id = this.id ? this.id.toNativeSource() + ' ' : ''

    var params = ''
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].toNativeSource()
      if (i !== this.params.length) {
        params += ','
      }
    }

    var body = this.body.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(function ' + id + '(' + params + ') ' + body + ')'
    else
      this.nativeSource = 'function ' + id + '(' + params + ') ' + body
  }

}
