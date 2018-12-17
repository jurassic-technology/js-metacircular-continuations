module.exports = function interpretSequenceExpression (node, prevCont, prevErrCont) {
  
  return this.iNodeArray(node.expressions, nextConnt, prevErrCont) 

  function nextCont (results) {
    return prevCont(results[ results.length - 1 ]) 
  }

}
