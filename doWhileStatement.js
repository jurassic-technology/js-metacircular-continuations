module.exports = function interpretDoWhileStatement (node, prevCont, prevErrCont) {

  const self = this
  let lastResult

  return self.i(node.body, nextContBody, prevErrCont) 
  
  function nextContBody (result) {

    lastResult = result
    return self.i(node.test, nextContTest, prevErrCont) 

  } 

  function nextErrContBody (errType, value, extra) {

    switch (errType) {

      case 'BreakStatement':

        if (!value) return prevCont(extra ? extra : lastResult) 
        else return prevErrCont(errType, value)

      case 'ContinueStatement':

        return self.i(node.test, nextConntTest, prevErrCont) 

      default: 

        return prevErrCont.apply(null, arguments)  

    }
  }

  function nextContTest (test) {

    if (test) return self.i(node.body, nextContBody, nextErrContBody) 
    else return prevCont(lastResult) 

  } 

} 
