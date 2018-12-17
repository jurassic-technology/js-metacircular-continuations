import Node from './Node'

export default class ThisExpression extends Node {
  constructor () {
    super()
    this.type = 'ThisExpression'
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont, prevErrCont) {
    return prevCont(scope.this)
  }

  toAST() {
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
      this.nativeSource = '(this)'
    else
      this.nativeSource = 'this'
  }
}

