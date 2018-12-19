module.exports = function interpretObjectMethod (node, prevCont, prevErrCont) {
  return prevCont(this.spawn(node))
} 
