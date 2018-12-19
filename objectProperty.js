module.exports = function interpretObjectProperty (node, prevCont, prevErrCont) {
  const self = this, rv = new Array

  if (this.computed) return this.i(node.key, nextContKey, prevErrCont) 

  return nextContKey(node.key.name) 

  function nextContKey (key) {
    rv.push(key)
    return self.i(node.value, nextContValue, prevErrCont) 
  }

  function nextContValue (value) {
    rv.push(value)
    return prevCont(rv) 
  }

} 
