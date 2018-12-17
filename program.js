module.exports = function interpretProgram (node, prevCont, prevErrCont) {

  return this.i(node.body, nextCont, nextErrCont) 

  function nextCont (results) {
    return prevCont(results[ results.length - 1]) 
  }

  function nextErrCont (errType, result) {
    switch (errType) {
      case 'ReturnStatement':
        return prevCont(result) 
      case 'ContinueStatement':
      case 'BreakStatement':
      case 'ReferenceError':
      case 'ThrowStatement':
      case 'Error': 
        return prevErrCont.apply(this, arguments) 
      default:
        break
    }
  }

} 
