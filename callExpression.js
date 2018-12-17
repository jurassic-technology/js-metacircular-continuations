module.exports = function interpretCallExpression (node, prevCont, prevErrCont) {

  const self = this
  let args, property, name

  return this.iNodeArray(node.arguments, scope, nextContArgs, prevErrCont) 


  function nextContArgs (argArray) {
    args = argArray
    if (node.callee.type === 'MemberExpression') {
      return self.i(node.callee.object, nextContMember, prevErrCont) 
    } else {
      return self.i(node.callee, nextContCallee, prevErrCont
    }

  } 

  function nextContMember (object) {

    if (node.callee.computed) {
      return self.i(node.callee.property, nextContComputed, prevErrCont)
    } else {
      return nextContCallee(object[node.callee.property.name], object) 
    }

  } 

  function nextContComputed (prop) {

    property = prop
    return nextContCallee(obj[prop], obj) 

  } 


  function nextContCallee (callee, object) {

  } 

}
