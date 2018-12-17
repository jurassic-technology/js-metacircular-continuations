import Node from './Node' 

export default class ThrowStatement extends Node {
  constructor (argument) {
    super()
    this.type = 'ThrowStatement'
    this.argument = argument
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }


  interpret (scope, prevCont, prevErrCont) {

    return this.argument.interpret(scope, nextCont, prevErrCont)

    function nextCont (argument) {
      return prevErrCont('ThrowStatement', argument)
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
    var argument = this.argument.toNativeSource()
    this.nativeSource = 'throw(' + argument +')'
  }
}

