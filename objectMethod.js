module.exports = function interpretObjectMethod (node, prevCont, prevErrCont) {
  return prevCont(this.spawnInterp(node))
} 
