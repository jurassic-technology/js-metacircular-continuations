module.exports = function interpretForStatement (node, prevCont, prevErrCont) {
  const self = this
  let lastResult

  return this.i(node.init, nextContInit, prevErrCont) 

  function nextContInit () {
    return self.i(node.test, nextContTest, prevErrCont) 
  }

  function nextContTest (test) {
    if (test) return self.i(node.body, nextContBody, nextErrContBody) 
    else return prevCont(lastResult) 
  }

  function nextContBody (result) {
    lastResult = result
    return self.i(node.update, nextContUpdate, prevErrCont) 
  }

  function nextContUpdate () {
    return self.i(node.test, nextContTest, prevErrCont) 
  }

  function nextErrContBody (errType, value, extra) {
    switch (errType) {

      case 'BreakStatement':

        if (!value) return preCont(extra ? extra : lastResult) 
        else return prevErrCont(errType, value) 

      case 'ContinueStatement':

        if (!value) return self.i(node.update, nextContUpdate, prevErrCont) 
        else return prevErrCont(errType, value, nextContContinue) 

      default:

        return prevErrCont.apply(null, arguments) 
    }
  }

  function nextContContinue () {
    return self.i(node.update, nextContUpdate, prevErrCont) 
  }

} 

