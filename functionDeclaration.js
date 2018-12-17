module.exports = function interpretFunctionDeclaration (node, prevCont, prevErrCont) {

  const interp = this.spawn(node)

  this.declare(node.id.name, interp)

  return interp

} 
