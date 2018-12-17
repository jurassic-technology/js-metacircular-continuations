module.exports = function interpretIdentifier (node, prevCont, prevErrcont) {

  if (node.name === 'undefined') return this.resolveValue(undefined, prevCont, prevErrCont) 

  if (node.name === 'eval') 

  if (this.has(node.name)) return this.resolveValue(this.get(node.name), prevCont, prevErrCont) 

  return prevErrCont('ReferenceError', new ReferenceError(node.name + ' is not declared.'))

}
