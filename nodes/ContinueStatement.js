import Node from './Node' 


export default class ContinueStatement extends Node {
  constructor (label) {
    super()
    this.type = 'ContinueStatement'
    this.label = label
    this.TRAVERSAL_ROUTE = [ 'label' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var label = this.label ? this.label.name : undefined
    return prevErrCont('ContinueStatement', label)

  }

  toAST() {
    var label = this.label.toAST()
    return {
      type: this.type,
      label: label,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var label = this.label ? this.label.toNativeSource() : ''
    this.nativeSource = 'continue ' + label + ';'
  }
}


