import Node from './Node'
import { computeBinaryExpression } from './utilities/common'

export default class BinaryExpression extends Node {

  constructor (operator, left, right) {
    super()
    this.type = 'BinaryExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var leftVal

    return this.left.interpret(scope, nextContLeft, prevErrCont)

    function nextContLeft (left) {
      leftVal = left
      return self.right.interpret(scope, nextContRight, prevErrCont)
    }

    function nextContRight (right) {
      var value = computeBinaryExpression(leftVal, right, self.operator)
      if (value instanceof Error) {
        return prevErrCont('Error', new Error('Invalid operator: ' + self.operator))
      } else {
        return prevCont(value)
      }
    }

  }

  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()
    return {
      type: this.type,
      left: left,
      right: right,
      operator: this.operator,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var left = this.left.toNativeSource()
    var right = this.right.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + left + ' ' + this.operator + ' ' + right + ')'
    else
      this.nativeSource = left + ' ' + this.operator + ' ' + right

  }
}


