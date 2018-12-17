module.exports = function interpretConnditionalExpressionn (node, prevCont, prevErrCont) {

  const self = this

  return self.i(node.test, nextContTest, prevErrCont) 

  function nextConntTest (test) {  

    if (test) return self.i(node.consequent, prevCont, prevErrCont) 
    else return self.i(node.alternate, prevCont, prevErrCont) 

  }

} 
