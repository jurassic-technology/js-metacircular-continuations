import Node from './Node' 

export default class WhileStatement extends Node {
  constructor (test, body) {
    super()
    this.type = 'WhileStatement'
    this.test = test
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'test', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var lastResult
    var self = this

    return this.test.interpret(scope, nextContTest, prevErrCont)

    function nextContTest (test) {

      if (test) {
        return self.body.interpret(scope, nextContBody, nextErrContBody)
      } else {
        return prevCont(lastResult)
      }

    }

    function nextContBody (result) {
      lastResult = result
      return self.test.interpret(scope, nextContTest, prevErrCont)
    }

    function nextErrContBody (errType, value, extra) {
      switch (errType){
        case 'BreakStatement':
          if (!value) {
            return prevCont(extra ? extra : lastResult)
          } else {
            return prevErrCont(errType, value)
          }
        case 'ContinueStatement':
          if (!value) {
            return self.test.interpret(scope, nextContTest, prevErrCont)
          } else {
            return self.test.interpret(scope, nextContTest, prevErrCont)
          }
        default:
          return prevErrCont.apply(null, arguments)
      }
    }
  }

  toAST() {
    var test = this.test.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      test: test,
      body: body
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var test = this.test.toNativeSource()
    var body = this.body.toNativeSource()
    this.nativeSource = 'while (' + test + ') ' + body
  }
}
