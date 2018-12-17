import Node from './Node'
import { interpretNodeArray } from './utilities/common'

export default class SwitchStatement extends Node {
  constructor (discriminant, cases) {
    super()
    this.type = 'SwitchStatement'
    this.discriminant = discriminant
    this.cases = cases
    this.TRAVERSAL_ROUTE = [ 'discriminant', 'cases' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var cases

    return this.discriminant.interpret(scope, nextContDiscriminant, prevErrCont)

    function nextContDiscriminant (discriminant) {

      for (var i = 0; i < this.cases.length; i++) {
        const test = this.cases[i].test.type === 'Identifier'
          ? this.cases[i].test.name === discriminant
          : this.cases[i].test.value === discriminant

        if (this.cases[i].test === null) {
          cases = this.cases.slice(i)
        }

        if (discriminant) {
          cases = this.cases.slice(i)
          break
        }
      }

      return interpretNodeArray(cases, scope, prevCont, nextErrContBreak)

    }

    function nextErrContBreak (errType, value) {
      if (errType === 'BreakStatement') {
        return prevCont(value)
      } else {
        return prevErrCont.apply(null, arguments)
      }
    }

  }

  toAST() {
    var cases = []
    for (var i = 0; i < this.cases.length; i++) cases.push(this.cases[i].toAST())
    var discriminant = this.discriminant.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      cases: cases,
      discriminant: discriminant
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var discriminant = this.discriminant.toNativeSource()

    var casesBody = ''
    for (var i = 0; i < this.cases.length; i++) {
      casesBody += this.cases[i].toNativeSource()
      if (i !== this.cases.length) {
        casesBody += ' '
      }
    }
    var cases = '{ ' + casesBody + ' }'

    this.nativeSource = 'switch (' + discriminant + ') ' + cases

  }
}
