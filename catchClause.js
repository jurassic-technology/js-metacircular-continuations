module.exports = function interpretCatchClause  (node, prevCont, prevErrCont) {
  
  return this.i(node.body, prevCont, prevErrcont)

} 
