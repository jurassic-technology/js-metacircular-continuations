module.exports = function interpretThrowStatement (node, prevCont, prevErrCont) {

  return this.i(node.argument, scope, nextContArg, prevErrCont) 

  function nextContArg (argument) {
    return prevErrCont(node.type, argument) 
  }

} 
