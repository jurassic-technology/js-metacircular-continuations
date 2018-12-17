import Node from './Node'
import { interpretNodeArray } from './utilities/common'

export default class ArrayExpression extends Node {
  constructor (elements) {
    super()
    this.type = 'ArrayExpression'
    this.elements = elements
    this.TRAVERSAL_ROUTE = [ 'elements' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    function nextCont () { return prevCont.apply(null, arguments) }
    return interpretNodeArray(this.elements, scope, nextCont, prevCont)

  }

  toAST() {

    var elements = []
    for (var i = 0; i < this.elements.length; i++) elements.push(this.elements[i].toAst())

    return {
      type: this.type,
      elements: elements,
      start: this.start,
      end: this.end
    }

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }


  setNativeSource () {

    var elements = ''
    for (var i = 0; i < this.elements.length; i++){
      elements += this.elements[i].toNativeSource()
      if (i !== this.elements.length) elements += ', '
    }

    if (this.extra && this.extra.parenthesized) this.nativeSource = '([' + elements + '])'
    else this.nativeSource = '[' + elements + ']'

  }

}

