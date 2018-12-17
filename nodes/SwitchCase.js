import Node from './Node' 
import { interpretNodeArray } from './utilities/common'

export default class SwitchCase extends Node {
  constructor (test, consequent) {
    super()
    this.type = 'SwitchCase'
    this.test = test
    this.consequent = consequent
    this.TRAVERSAL_ROUTE = [ 'test', 'consequent' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.consequent, scope, prevCont, prevErrCont)

  }

  toAST() {
    var test = this.test.toAST()

    var consequent = []

    for (var i = 0; i < this.consequent.length; i++){
      consequent.push(this.consequent[i].toAST())
    }

    return {
      type: this.type,
      start: this.start,
      end: this.end,
      test: test,
      consequent: consequent
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var test = this.test
      ? this.test.toNativeSource()
      : ''

    var consequent = ''
    for (var i = 0; i < this.consequent.length; i++){
      consequent += this.consequent[i].toNativeSource()
      if (i !== this.consequent.length) {
        consequent += ' '
      }
    }

    if (test.length)
      this.nativeSource = 'case ' + test + ': ' + consequent
    else
      this.nativeSource = 'default: ' + consequent

  }
}



