module.exports = function interpretMemberExpression (node, prevCont, prevErrCont) {
  
  const self = this 
  let obj

  return this.i(node.object, nextContObject, prevErrCont) 
  
  function nextContObject (object) {

    let val 
    obj = object

    if (node.property.type === 'Identifier') {

      const descriptor = Object.getOwnPropertyDescriptor(obj, node.property.name) 

      if (descriptor.get) {

        val = new Promise(function (resolve, reject) {
          return descriptor.get.execute(undefined, resolve, reject) 
        })

      } else {
        
        val = object[ self.property.name ]

      }

      return this.resolveValue(val, nextContResolveVal, prevErrCont) 

    } else {

      return self.i(node.property, nextContComputed, prevErrCont) 

    } 

  } 

  function nextContComputed (propertyName) {

    let val
    const descriptor = Object.getOwnPropertyDescriptor(obj, propertyName) 

    if (descriptor.get) {

    } else {
      val = obj[ propertyName ]
    }

    return resolveValue(val, nextContResolveVal, prevErrCont) 

  }

  function nextContResolveVal (value) {

    return prevCont(value, obj, self.property.name) 

  } 

} 
