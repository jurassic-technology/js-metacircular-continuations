module.exports = function interpretStringLiteral (node, prevCont, prevErrCont) {

  return prevCont(node.value) 

} 
