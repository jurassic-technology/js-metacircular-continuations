module.exports = function interpretSwitchCase (node, prevCont, prevErrCont) {

  return this.i(node.consequenct, prevCont, prevErrCont) 

} 
