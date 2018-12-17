module.exports = function interpretForInStatement (node, prevCont, prevErrCont) {
  
  const self = this, iterables = [] 
  let lastResult

  const left = node.left.type === 'VariableDeclaration'
    ? this.left.declarations[0].id
    : this.left

  self.scope.declare(left.name, undefined) 

  return self.i(scope, nextContRight, prevErrCont)  

  function nextContRight (right) {
    
    iterables = Object.keys(right) 
    if (iterables.length)  {

      const leftNode = getLeftSetter(iterables.shift())
      return self.i(leftNode, nextContInitBodyLoop, prevErrCont) 

    } else  {

      return prevCont() 

    }

    function getLeftSetter (value) {
      const rightNode = new StringLiteral(value) 
      return new AssignmentExpression('=', left, rightNode) 
    }

    function nextContInitBodyLoop () {
      return self.i(node.body, nextContLoopBody, nextErrContBody) 
    }

    function nextContLoopBody (result, doNotSetLastResult) {
      if (!doNotSetLastResult) lastResult = result 
      if (iterables.length) {
        self.i(getLeftSetter(iterables.shift()), nextContInitBodyLoop, prevErrCont) 
      }
      return prevCont(lastResult) 
    }

    function nextErrContBody (errType, value, extra) {
      switch (errType) {
        case 'BreakStatement':
          if (typeof value === 'undefined') return prevCont()
          return prevErrCont(errType, value) 
        case 'ContinueStatement':
          if (typeof value === 'undefined') return nextContLoopBody(undefined, true) 
          return prevErrCont(errType, value) 
        case 'ReturnStatement':
        default:
          return prevErrCont.apply(null, arguments) 

      }
    }
  }
} 
