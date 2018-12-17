import Node from './Node'

export default class NullLiteral extends Node {
  constructor () {
    super()
    this.type = 'NullLiteral'
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont) {
    return prevCont(null)
  }

  toAST () {
    return {
      type: this.type,
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
      this.nativeSource = '(null)'
    else
      this.nativeSource = 'null'
  }
}
