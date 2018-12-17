module.exports = function interpretLabeledStatement (node, prevCont, prevErrCont) {
  const self = this

  return this.i(node.body, prevCont, nextErrContLabel) 

  function nextErrContLabel (errType, label, extra) {
    switch (errType) {
      case 'BreakStatement':
        if (label === node.label.name) return prevCont(extra) 
        else return prevErrCont.apply(null, arguments) 
      case 'ContinueStatement': 
        if (label === node.label.name) return extra()
        else return prevErrCont.apply(null, arguments) 
      default: 
        return prevErrCont.apply(null, arguments) 
    } 

  }

} 
