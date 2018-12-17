import Node from './Node' 
import { interpretNodeArray } from './utilities/common'

export default class SequenceExpression extends Node {
  constructor (expressions) {
    super()
    this.type = 'SequenceExpression'
    this.expressions = expressions
    this.TRAVERSAL_ROUTE = [ 'expressions' ]
  }

  interpret (scope, prevCont, errCont) {

    interpretNodeArray(this.expressions, scope, nextCont, errCont)

    function nextCont (results) {

      return prevCont(results[ results.length - 1 ])

    }

  }

  toAST() {

    var expressions = []
    for (var i = 0; i < this.expressions.length; i++){
      expressions.push(this.expressions[i].toAst())
    }

    return {
      type: this.type,
      start: this.start,
      end: this.end,
      expressions: expressions
    }

  }

  toNativeSource (type) {
    this.setNativeSource()
    return this.nativeSource
  }


  setNativeSource () {

    var expressions = ''
    for (var i = 0; i < this.expressions.length; i++){
      expressions += this.expressions[i].toNativeSource()
      if (i !== this.expressions.length) {
        expressions += ', '
      }
    }

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + expressions + ')' + ';'
    else
      this.nativeSource = expressions + ';'

  }

}

