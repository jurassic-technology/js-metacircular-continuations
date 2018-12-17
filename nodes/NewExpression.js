import Node from './Node'
import { interpretNodeArray } from './utilities/common'

export default class NewExpression extends Node {

  constructor (callee, args, start, end) {
    super()
    this.type = 'NewExpression'
    this.callee = callee
    this.arguments = args
    this.TRAVERSAL_ROUTE = [ 'callee', 'args' ]

  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, args, thisObj

    return interpretNodeArray(this.arguments, scope, nextContArgs, prevErrCont)

    function nextContArgs (_args) {

      args = _args
      return self.callee.interpret(scope, nextContCallee, prevErrCont)

    }

    function nextContCallee (Constructor) {

      if (!(Constructor instanceof AsyncScope)) {

        var err = new TypeError(type + ' is not a function')
        return prevErrCont(err)

      } else {

        thisObj = Object.create(Constructor.prototype || new Object())
        var newCallee = Constructor.clone(args, thisObj)
        return newCallee.interpret(nextContInterpret, prevErrCont)

      }

    }

    function nextContInterpret (value, isReturn) {

      if (isReturn) {
        if (!value instanceof Object) {
          value = thisObj
        }
      } else {
        value = thisObj
      }

      return prevCont(value)

    }

  }

  toAST () {
    var callee = this.callee.toAST()
    var args = []
    for (var i = 0; i < this.arguments.length; i++){
      args.push(this.arguments[i].toAST())
    }
    return {
      type: this.type,
      callee: callee,
      arguments: args,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }


  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var args = ''
    for (var i = 0; i < this.arguments.length; i++) {
      args += this.arguments[i].toNativeSource()
      if (i !== this.arguments.length) {
        args += ', '
      }
    }
    var callee = this.callee.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(new ' + callee + '(' + args + '))'
    else
      this.nativeSource = 'new ' + callee + '(' + args + ')'
  }
}


