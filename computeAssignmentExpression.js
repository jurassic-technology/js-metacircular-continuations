module.exports = function computeAssignmentExpression (left, right, operator) {
  var val
  switch (node.operator) {
    case '+=':
      val = left + right
      break
    case '-=':
      val = left - right
      break
    case '*=':
      val = left * right
      break
    case '/=':
      val = left / right
      break
    case '%=':
      val = left % right
      break
    case '<<=':
      val = left << right
      break
    case '>>=':
      val = left >> right
      break
    case '>>>=':
      val = left >>> right
      break
    case '&=':
      val = left & right
      break
    case '|=':
      val = left | right
      break
    case '^=':
      val = left ^ right
      break
    default:
      val = new Error()
  }
  return val
}
