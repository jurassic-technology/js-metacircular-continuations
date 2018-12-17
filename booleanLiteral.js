module.exports = interpretBooleanLiteral (node, prevCont, prevErrCont) {
  
  return prevCont(node.value) 

} 
