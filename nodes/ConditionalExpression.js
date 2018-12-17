import Node from './Node'  

export default class ConditionalExpression extends Node {
  constructor (test, consequent, alternate) {
    super()
    this.type = 'ConditionalExpression'
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
    this.TRAVERSAL_ROUTE = [ 'test', 'consequent', 'alternate' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this

    return this.test.interpret(scope, nextContTest, prevErrCont)

    function nextContTest (test) {
      if (test) {
        return self.consequent.interpret(scope, prevCont, prevErrCont)
      } else {
        return self.alternate.interpret(scope, prevCont, prevErrCont)
      }
    }

  }

  toAST() {
    var test = this.test.toAST()
    var consequent = this.consequent.toAST()
    var alternate = this.alternate.toAST()
    return {
      type: this.type,
      test: test,
      consequent: consequent,
      alternate: alternate,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var test = this.test.toNativeSource()
    var consequent = this.consequent.toNativeSource()
    var alternate = this.alternate.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + test + ' ? ' + consequent + ' : ' + alternate + ')'
    else
      this.nativeSource = test + ' ? ' + consequent + ' : ' + alternate

  }
}


