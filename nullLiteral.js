module.exports = function interpretNullLiteral (node, prevCont, prevErrCont) {
  return prevCont(null) 
} 
