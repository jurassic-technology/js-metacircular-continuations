import Node from './Node' 

export default class StringLiteral extends Node {
  constructor (value) {
    super()
    this.type = 'StringLiteral'
    this.value = value
    this.TRAVERSAL_ROUTE = [ ]
  }


  interpret (scope, prevCont) {

    return prevCont(this.value)

  }

  toAST () {
    return {
      type: this.type,
      value: this.value,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '("' + this.value + '")'
    else
      this.nativeSource = '"' + this.value + '"'
  }
}
