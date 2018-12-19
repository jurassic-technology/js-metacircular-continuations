module.exports = function setValue (node, value, prevCont, prevErrCont) {

  if (node.type === 'Identifier') {

    var success = this.set(node.name, value) 
    if (!success) return prevErrCont("ReferenceError", new ReferenceError())
    else return prevCont(value) 

  } else if (node.type === 'MemberExpression') {
        
    var propertyName = node.computed ? node.property.value : node.property.name 

    return this.i(node.object, nextContObject, prevErrCont) 

    function nextContObject (object) {

      const descriptor = Object.getOwnPropertyDescriptor(object, propertyName)

      if (descriptor && descriptor.set)  {

        const interp = descriptor.set 
        const promise = new Promise(function (resolve, reject) { return methodScope.interpret(value, resolve, reject) })  
        return this.resolveValue(promise) 

      } else {

        object[propertyName] = value
        return this.resolveValue(value, prevCont, prevErrCont) 

      }   
    }   
  }   
} 


}
