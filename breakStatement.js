module.exports = function interpretBreakStatement (node, prevCont, prevErrCont) {
  
  const label = node.label ? node.label.name : undefined
  return prevErrCont('BreakStatement', label) 
  
} 
