module.exports = function interpretNumericLiteral (node, prevCont, prevErrCont) {
  return prevCont(Number(node.value))
} 
