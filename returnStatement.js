module.exports = function interpretReturnStatement (node, prevCont, prevErrCont) {

  if (node.argument) return this.i(node.argument, nextCont, prevErrCont)
  else return prevErrCont(node.type) 

  function nextCont (argument) {
    return prevErrCont(node.type, argument) 
  }

} 
