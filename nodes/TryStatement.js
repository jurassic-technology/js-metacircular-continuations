import Node from './Node' 

export default class TryStatement extends Node {
  constructor (block, handler, finalizer) {
    super()
    this.type = 'TryStatement'
    this.block = block
    this.handler = handler
    this.finalizer = finalizer
    this.TRAVERSAL_ROUTE = [ 'block', 'handler', 'finalizer' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, tryValue

    return this.block.interpret(scope, nextContTry, nextContInvokeCatchOrFinally)

    function nextContTry (tryVal) {
      tryValue = tryVal
      if (self.finalizer) {
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont)
      } else {
        return prevCont(tryValue)
      }
    }

    function nextContInvokeCatchOrFinally (error) {

      if (self.handler) {

        var handlerScope = scope.newAsyncScope(self.handler)
        handlerScope.declare(self.handler.param.name, arguments[1])
        return handlerScope.interpret(nextContCatch, prevErrCont)

      } else if (self.finalizer) {
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont)
      }

    }

    function nextContCatch (value, isReturn) {

      if (isReturn) {
        return prevErrCont('ReturnStatement', value)
      } else if (self.finalizer) {
        tryValue = value
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont)
      } else {
        return prevCont(value)
      }

    }

    function nextContFinally (finalizerValue) {

      var contValue = finalizerValue
        ? finalizerValue
        : tryValue

      return prevCont(contValue)

    }

  }

  toAST() {
    var handler = this.handler.toAST()
    var block = this.block.toAST()
    var finalizer = this.finalizer.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      block: block,
      handler: handler,
      finalizer: finalizer
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var block = this.block.toNativeSource()
    var handler = this.handler ? ' ' + this.handler.toNativeSource() : ''
    var finalizer = this.finalizer ? ' finally ' + this.finalizer.toNativeSource() : ''
    this.nativeSource = 'try ' + block + handler + finalizer
  }

}
