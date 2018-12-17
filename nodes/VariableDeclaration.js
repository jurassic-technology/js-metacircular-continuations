import Node from './Node' 
import { interpretNodeArray } from './utilities/common'

export default class VariableDeclaration extends Node {
  constructor (declarations, kind) {
    super()
    this.type = 'VariableDeclaration'
    this.declarations = declarations
    this.kind = kind
    this.TRAVERSAL_ROUTE = [ 'declarations' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.declarations, scope, nextContDeclarators, prevErrCont)

    function nextContDeclarators () {
      return prevCont()
    }

  }

  toAST() {
    var declarations = []
    for (var i = 0; i < this.declarations.length; i++){
      declarations.push(this.declarations[i].toAST())
    }
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      declarations: declarations
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var declarations = ''
    for (var i = 0; i < this.declarations.length; i++) {
      declarations += this.declarations[i].toNativeSource()
      if (i !== this.declarations.length) {
        declarations += ', '
      }
    }

    this.nativeSource = 'var ' + declarations + ';'
  }
}
