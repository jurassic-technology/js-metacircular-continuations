module.exports = function interpretExpressionStatement (node, prevCont, prevErrCont) {

  return this.i(node.expression, prevCont, prevErrCont) 

} 
