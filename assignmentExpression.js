module.exports = function interpretAssignmentExpressionn (node, prevCont, prevErrCont) {

  let rightVal

  return this.i(node.right(nextContRight, prevErrCont) 

  function nextContRight (right) {

    rightVal = right
    if (node.operator === '=') {
      return this.setValue(node.left, right, prevCont, prevErrCont) 
    } else {
      return this.i(node.left, nextContLeft, prevErrCont) 
    }

  }

  function nextContLeft (left) { 

    const value = this.computeAssignmentExpression(left, rightVal, node.operator)
    if (value instanceof Error) return prevErrCont(new Error('Invalid operator: ' + node.operator))
    else return setValue(node.left, value, prevCont, prevErrCont) 

  } 


} 
