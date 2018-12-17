module.exports = function interpretTryStatement (node, prevcont, prevErrCont) {

  const self = this
  let tryValue 

  return this.i(node.block, nextContTry, nextContInvokeCatchOrFinally) 

  function nextContTry (tryVal) { 

    tryValue = tryVal

    if (node.finalizer) return self.i(node.finalizer, nextContFinally, prevErrCont) 
    else return prevCont(tryValue) 

  } 

  function netContInvokeCatchOrFinally (error) {

    if (node.handler) {
      const handlerScope = scope.newAsyncScope(self.handler) 
      handlerScope.declare(node.handler.param.name, arguments[1]) 
      return handlerScope.i(nextContCatch, prevErrCont)
    } else if (node.finalizer) {
      return self.i(node.finalizer, nextContFinally, prevErrCont)
    }

  }

  function nextContCatch (value, isReturn) {

    if (isReturn) return prevErrCont('ReturnStatement', value)  

    if (node.finalizer) {
      tryValue = value 
      return self.i(node.finalizer, nextContFinally, prevErrCont)  
    }

    return prevCont(value) 

  } 

  function nextContFinally (finalizerValue) {

    return prevCont(finalizerValue ? finalizerValue : tryValue) 

  }


} 
