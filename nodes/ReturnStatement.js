import Node from './Node'

export default class ReturnStatement extends Node {
  constructor (argument) {
    super()
    this.type = 'ReturnStatement'
    this.argument = argument
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    if (this.argument) {
      return this.argument.interpret(scope, nextCont, prevErrCont)
    } else {
      return prevErrCont(this.type)
    }

    function nextCont (argument) {
      return prevErrCont('ReturnStatement', argument)
    }

  }

  toAST() {
    var argument = this.argument.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      argument: argument
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var argument = this.argument
      ? this.argument.toNativeSource()
      : ''

    this.nativeSource = 'return ' + argument + ';'

  }
}



