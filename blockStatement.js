module.exports = function interpretBlockStatement (node, prevCont, prevErrCont) {

  return this.iNodeArray(node.body, nextCont, nextErrCont) 

  function nextCont (results) {

    return prevCont(results [ results.length - 1 ])

  } 

  function nextErrCont (errType, result) { 

    switch (errType) {
      case 'ReturnStatement': 
        return prevCont(result, true) 
      case 'ContinueStatement': 
      case 'BreakStatement': 
      case 'ReferenceError':
      case 'ThrowStatement':
      case 'Error':
      default:
        return prevErrCont.apply(null, arguments)

    } 

  } 

} 
