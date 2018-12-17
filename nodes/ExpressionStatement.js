import Node from './Node' 

export default class ExpressionStatement extends Node {
  constructor(expression) {
    super()
    this.type = 'ExpressionStatement'
    this.expression = expression
    this.TRAVERSAL_ROUTE = [ 'expression' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return this.expression.interpret(scope, prevCont, prevErrCont)

  }

  toAST() {
    var ast = {
      expression: this.expression.toAST(),
      type: this.type,
      start: this.start,
      end: this.end
    }

    if (this.extra) {
      ast.extra = this.extra
    }

    return ast

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var source = this.expression.toNativeSource()
    if (source.charAt(source.length - 1) !== ';') source += ';'
    this.nativeSource = source
  }
}

