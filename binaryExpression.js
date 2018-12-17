module.exports = function interpretBinaryExpression (node, prevCont, prevErrCont) {

  const self = this
  let leftVal

  return this.i(node.left, nextContLeft, prevErrCont) 

  function nextContLeft (left) { 

    leftVal = left
    return self.i(node.right, nextContRight, prevErrCont) 

  }

  function nextContRight (right) { 

    const value = self.computeBinaryExpression(leftVal, right, node.operator) 

    if (value instanceof Error) {
      return prevErrCont('Error', new Error('Invalid operator: ' + self.operator)) 
    } else {
      return prevCont(value) 
    }

  } 

} 
