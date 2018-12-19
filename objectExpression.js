module.exports = function interpretObjectExpression (node, prevCont, prevErrCont) {

  const self = this

  return this.iNodeArray(node.properties, nextContProperties, prevErrCont) 

  function nextContProperties (results) {

    const obj = new Object

    for (var i = 0; i < node.properties.length; i++) {
      const el = results[i] 
      const prop = node.properties[i]

      if (prop.type === 'ObjectMethod') {

          const descriptor = { configurable: true }
          descriptor[ prop.kind ] = el
          Object.defineProperty(obj, self.properties[i].key.name, descriptor) 

      } else {

        if (el[1] instanceof AsyncInterp) el[1].this = obj
        Object.defineProperty(obj, el[0], { value: el[1] }) 

      }
      
      return prevCont(obj) 

    }
  }
} 
