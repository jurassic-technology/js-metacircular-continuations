module.exports = function interpretThisExpression (node, prevCont, prevErrCont) {
  return prevCont(this.this)  
}
