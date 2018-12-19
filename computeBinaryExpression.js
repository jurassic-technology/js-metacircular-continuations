export function computeBinaryExpression (left, right, operator) {
  var value
  switch (operator) {
    case '+':
      value = left + right
      break
    case '-':
      value = left - right
      break
    case '===':
      value = left === right
      break
    case '==':
      value = left == right
      break
    case '!==':
      value = left !== right
      break
    case '!=':
      value = left != right
      break
    case '<':
      value = left < right
      break
    case '<=':
      value = left <= right
      break
    case '>':
      value = left > right
      break
    case '>=':
      value = left >= right
      break
    case '*':
      value = left * right
      break
    case '/':
      value = left / right
      break
    case 'instanceof':
      value = left instanceof right
      break
    case 'in':
      value = left in right
      break
    case '^':
      value = left ^ right
      break
    case '<<':
      value = left << right
      break
    case '>>':
      value = left >> right
      break
    case '>>>':
      value = left >>> right
      break
    case '%':
      value = left % right
      break
    case '&':
      value = left & right
      break
    case '|':
      value = left | right
      break
    default:
      value = new Error()
  }
  return value 
} 

