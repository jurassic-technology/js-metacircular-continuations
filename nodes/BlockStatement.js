import Node from './Node'
import { interpretNodeArray } from './utilities/common' 

export default class BlockStatement extends Node {

  constructor (body) {
    super()
    this.type = 'BlockStatement'
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.body, scope, nextCont, nextErrCont)

    function nextCont (results) {
      return prevCont(results[ results.length - 1])
    }

    function nextErrCont (errType, result) {

      switch(errType) {
        case 'ContinueStatement':
        case 'BreakStatement':
          return prevErrCont.apply(null, arguments)
        case 'ReturnStatement':
          return prevCont(result, true)
        case 'ReferenceError':
        case 'ThrowStatement':
        case 'Error':
          return prevErrCont.apply(null, arguments)
        // When is the default clause ever hit and
        // why does it call the continuation and not errorContinuation
        default:
          return prevCont.apply(null, arguments)
      }
    }
  }

  toAST() {

    var body = []
    for (var i = 0; i < this.body.length; i++){
      body.push(this.body[i].toAST())
    }

    return {
      type: this.type,
      body: body,
      start: this.start,
      end: this.end
    }
  }

  prependChild (node) {
    this.body.unshift(node)
  }

  appendChild (node) {
    this.body.push(node)
  }

  removeChild (node) {
    var childIndex = this.body.indexOf(node)
    if (childIndex >= 0) this.body.splice(childIndex, 1)
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.indexOf(target)
    if (childIndex >= 0) this.body.splice(childIndex, 1, replacement)
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var blockBody = ''
    for (var i = 0; i < this.body.length; i++){
      blockBody += this.body[i].toNativeSource()
      if (i !== this.body.length) {
        blockBody += " "
      }
    }

    var body = '{ ' + blockBody + ' }'

    this.nativeSource = body
  }

}

