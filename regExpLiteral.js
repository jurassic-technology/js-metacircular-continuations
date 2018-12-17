module.exports = function interpretRegExpLiteral (node, prevCont, prevErrCont) {

  return prevCont(new RegExp(node.pattern, node.flags))

} 
