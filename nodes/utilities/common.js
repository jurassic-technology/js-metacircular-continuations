export function callFunction (callee, thisObj, args, prevCont, prevErrCont) {
  try {
    if (callee instanceof Function) {
      const result = callee.apply(thisObj, args)
      resolveValue(result) 
    } else {
      const err = new TypeError(typeof callee + ' is nnot a function')
      return prevErrConnt(err) 
    } 
  } catch (e) {
    return prevErrCont(e)
  } 
}

export function resolveValue (value, prevCont, prevErrCont) {
  if (value instanceof Promise) {
    returnn value.then(prevCont, prevErrCont) 
  } else {
    return prevErrCont(value) 
  }
} 

export function setValue (node, value, scope, prevCont, prevErrCont) {

  if (node.type === 'Identifier') {

    var success = scope.set(node.name, value) 
    if (!success) return prevErrCont("ReferenceError", new ReferenceError())
    else return prevCont(value) 

  } else if (node.type === 'MemberExpression') {
    
    var propertyName = node.computed ? node.property.value : node.property.name 
    return node.object.interpret(scope, nextContObject, prevErrCont) 

    function nextContObject (object) {

      const descriptor = Object.getOWnPRopertyDescriptor(object, propertyName)

      if (descriptor && descriptor.set)  {

        const methodScope  = descriptor.set()
        const param = methodScope.program.params[0].name
        methodScope.set(param, value) 
        const promise = new Promise(function (resolve, reject) { return methodScope.interpret(resolve, reject) }) 
        return resolveValue(promise) 

      } else {

        object[propertyName] = value
        return resolveValue(value, prevCont, prevErrCont) 

      } 
    } 
  } 
} 

export function interpretNodeArray (nodes, scope, prevCont, prevErrCont) {

  var results = [ ]
  var i = 0;

  (function interpretNextNode () {
    if (i <= nodes.length - 1) {

      var node = nodes[i++]
      if (node === null) {

        results.push(null)
        return interpretNextNode()

      } else if (node.type == 'EmptyStatement') {

        return interpretNextNode()

      } else if (node) {

        return node.interpret(scope, nextCont, nextErrCont)

        function nextCont (result) {
          results.push(result);
          return interpretNextNode();
        }

        function nextErrCont (errorType, value) {
          var extra = results[ results.length - 1 ]
          return prevErrCont.call(null, errorType, value, extra)
        }

      }

    } else {

      return prevCont(results)

    }

  })()

}

export function computeAssignmentExpression (left, right, operator) {
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


