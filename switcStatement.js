module.exports = function interpretSwitchStatement (node, prevCont, prevErrCont) {

  let cases, discriminator, default

  return this.i(node.discriminant, nextContDiscriminant, prevErrCont) 

  function nextContDiscriminant (discriminant) {
    discriminator = discriminant
    return nextContCases(node.cases, nextContMatch, prevErrCont) 

    for (var i = 0; i < node.cases.length; i++) {

      const test = node.cases[i].test.type === 'Identifier' 
        ? node.cases[i].test.name === discriminant
        : node.cases[i].test.value === discriminant

      if (node.cases[i].test.type === 'Identifier')
      if (test) cases = node.cases.slice(i) 
      break

      if (discriminant) {
        cases = node.cases.slice(i) 
      }

    }

  } 

  function nextContCases (tests) {

    for (var i = 0; i < tests.length; i++){
      if (tests[i] === null) default = node.cases[i]
      if (tests[i] === discriminator) {
        cases = node.cases.slice(i) 
        break
      }
    }

    if (!cases.length) cases = [ default ] 

    return this.iNodeArray(cases, prevCont, prevErrCont) 

  }

} 
