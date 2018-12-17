import Node from './Node'

export default class ForOfStatement extends Node {
  constructor (left, right, body) {
    super()
    this.type = 'ForOfStatement'
    this.left = left
    this.right = right
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'left', 'right', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, iterables = [], lastResult;

    const left = this.left.type === 'VariableDeclaration'
      ? this.left.declarations[0].id
      : this.left

    scope.declare(left.name, undefined)

    return this.right.interpret(scope, nextContRight, prevErrCont)

    function nextContRight (right) {

      for (var i = 0; i < right.length; i++) {
        iterables.push(right[i])
      }

      if (iterables.length) {

        const leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)

      } else {
        return prevCont()
      }

    }

    function getLeftSetter (value) {
      const rightNode = new StringLiteral(value)
      return new AssignmentExpression('=', left, rightNode)
    }

    function nextContInitBodyLoop () {
      return self.body.interpret(scope, nextContLoopBody, nextErrContBody)
    }

    function nextContLoopBody (result) {

      lastResult = result
      if (iterables.length) {
        const leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)
      } else {
        return prevCont(lastResult)
      }

    }

    function nextErrContBody (errType, value, extra) {

      switch (errType) {
        case 'BreakStatement':
          if (typeof value === 'undefined') {
            return prevCont()
          } else {
            return prevErrCont(errType, value)
          }
        case 'ContinueStatement':
          if (typeof value === 'undefined') {
            return nextContLoopBody(undefined, true)
          } else {
            return prevErrCont(errType, value)
          }
        case 'ReturnStatement':
        default:
          return prevErrCont.apply(null, arguments)
      }

    }

  }

  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()
    var body = this.body.toAST()
    return {
      left: left,
      right: right,
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
    var left = this.left.toNativeSource()
    if (left.charAt(left.length - 1) == ';') left = left.slice(0, left.length - 1)
    var right = this.right.toNativeSource()
    var body = this.body.toNativeSource()
    return 'for (' + left + ' of ' + right + ') ' + body
  }
}


