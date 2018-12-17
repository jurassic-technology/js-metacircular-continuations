import Node from './Node'
import  { computeAssignmentExpression, setValue } from './utilities/common'

export default class AssignmentExpression extends Node {
  constructor (operator, left, right) {
    super()
    this.type = 'AssignmentExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }

  interpret (scope, prevCont, prevErrCont) {


    var self = this
    var rightVal

    return this.right.interpret(scope, nextContRight, prevErrCont)

    function nextContRight (right) {
      rightVal = right
      if (self.operator == '=') {
        return setValue(self.left, right, scope, prevCont, prevErrCont)
      } else {
        self.left.interpret(scope, nextContLeft, prevErrCont)
      }
    }

    function nextContLeft (left) {
      var value = computeAssignmentExpression(left, rightVal, self.operator)
      if (value instanceof Error) {
        prevErrCont(new Error('Invalid operator: ' + self.operator))
      } else {
        return setValue(self.left, value, scope, prevCont, prevErrCont)
      }
    }

  }

  toAST () {
    var left = this.left.toAST()
    var right = this.right.toAST()

    return {
      type: this.type,
      operator: this.operator,
      left: left,
      right: right,
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
      this.nativeSource = '(' + left + this.operator + right + ')'
    else
      this.nativeSource = left + ' ' + this.operator + ' ' + right

  }
}

