module.exports = function (node, prevCont, prevErrCont) {

  function nextCont () { return prevCont.apply(null, arguments) } 
  return this.interpretNodeArray(node.elements, nextCont, prevCont) 

} 
