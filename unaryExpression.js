module.exports = function interpretUnaryExpression (node, prevCont, prevErrCont) {
  const self = this
  let obj

  if (node.argument instanceof MemberExpression) {

    return this.i(node.argument, nextContMemberObject, prevErrCont) 

  } else {

    if (node.operator === 'typeof' && 
        node.argunment.type === 'Identifier' && 
        !this.has(node.argument.name)){

      return prevCont(undefined)

    } else {

      return this.i(node.argument, nextContArgument, prevErrCont) 

    }

  }

} 
