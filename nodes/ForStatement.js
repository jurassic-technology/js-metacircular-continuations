import Node from './Node' 

export default class ForStatement extends Node {
  constructor (init, test, update, body) {
    super()
    this.type = 'ForStatement'
    this.init = init
    this.test = test
    this.update = update
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'init', 'test', 'update', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var lastResult
    var self = this

    return this.init.interpret(scope, nextContInit, prevErrCont)

    function nextContInit() {
      return self.test.interpret(scope, nextContTest, nextErrContBody)
    }

    function nextContTest (test) {

      if (test) {
        return self.body.interpret(scope, nextContBody, nextErrContBody)
      } else {
        return prevCont(lastResult)
      }

    }

    function nextContBody (result) {

      lastResult = result
      return self.update.interpret(scope, nextContUpdate, prevErrCont)

    }

    function nextContUpdate () {
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
            return self.update.interpret(scope, nextContUpdate, prevErrCont)
          } else {
            return prevErrCont(errType, value, nextContContinue)
          }
        default:
          return prevErrCont.apply(null, arguments)
      }
    }

    function nextContContinue () {
      return self.update.interpret(scope, nextContUpdate, prevErrCont)
    }

  }

  toAST() {
    var init = this.init.toAST()
    var test = this.test.toAST()
    var update = this.update.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      init: init,
      test: test,
      update: update,
      body: body,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }


  setNativeSource () {
    var init = this.init.toNativeSource()
    if (init.charAt(init.length - 1) !== ';') init += '; '
    else init += ' '
    var test = this.test.toNativeSource() + '; '
    var update = this.update.toNativeSource()
    var body = this.body.toNativeSource()
    return 'for (' + init + test + update + ') ' + body
  }

}
