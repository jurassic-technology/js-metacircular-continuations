import Node from './Node'

export default class LogicalExpression extends Node {
  constructor (operator, left, right) {
    super()
    this.type = 'LogicalExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, leftVal

    return this.left.interpret(scope, nextContLeft, prevErrCont)

    function nextContLeft (left) {
      leftVal = left
      if (!left && self.operator === '&&') {
        return prevCont(left)
      } else if (left && self.operator === '||') {
        return prevCont(left)
      } else {
        return self.right.interpret(scope, nextContRight, prevErrCont)
      }
    }

    function nextContRight (right) {
      if (self.operator === '&&') {
        return prevCont(leftVal && right)
      } else if (self.operator === '||') {
        return prevCont(leftVal || right)
      } else {
        var err = new SyntaxError('Logical operator "' + self.operator + '" not supported')
        return prevErrCont(err)
      }
    }

  }

  toAST() {
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


  toNativeSource() {
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
