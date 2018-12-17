module.exports = function interpretIfStatement (node, prevCont, prevErrCont) {  
  const self = this
  return this.i(node.test, nextContTest, prevErrCont) 

  function nextContTest (test) {

    if (test) return self.i(node.consequent, prevCont, prevErrCont)  
    else if (node.alternate) return self.i(node.alternate, prevCont, prevErrCont) 
    else return prevCont

  } 
} 
