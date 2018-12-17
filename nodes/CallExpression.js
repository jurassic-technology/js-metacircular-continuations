import Node from './Node' 
import { interpretNodeArray } from './utilities/common'

export default class CallExpression extends Node {
  constructor (callee, args) {
    super()
    this.type = 'CallExpression'
    this.arguments = args
    this.callee = callee
    this.TRAVERSAL_ROUTE = [ 'callee', 'arguments' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, args, property

    return interpretNodeArray(this.arguments, scope, nextContArgs, prevErrCont)

    function nextContArgs (argArray) {

      args = argArray
      if (self.callee.type === 'MemberExpression') {
        return self.callee.object.interpret(scope, nextContMember, prevErrCont)
      } else {
        return self.callee.interpret(scope, nextContCallee, prevErrCont)
      }

    }

    function nextContMember (object) {

      if (self.callee.computed) {
        return self.callee.property.interpret(scope, nextContComputed, prevErrCont)
      } else {
        property = self.callee.property.name
        return nextContCallee(object[self.callee.property.name], object)
      }

    }

    function nextContComputed (prop) {
      property = prop
      return nextContCallee(obj[prop], obj)
    }

    function nextContCallee (callee, object) {

      if (callee instanceof AsyncScope) {

        return callee.invoke(args, object, prevCont, prevErrCont)

      } else if (object instanceof AsyncScope) {

        if (property === 'call') {

          return object.call(args, prevCont, prevErrCont)

        } else if (property === 'apply') {

          return object.apply(args, prevCont, prevErrCont)

        } else if (property === 'bind') {

          var boundScope = object.bind(args)
          return prevCont(boundScope)

        } else {

          if (object && object[callee.name]) {
            const retVal = callee.apply(object, args)
            return prevCont(retVal)
          } else if (global[callee.name]) {
            const retVal = callee(args)
            return prevCont(retVal)
          }

        }

      } else {

        if (self.callee.type === 'MemberExpression') {

          if (object[callee.name]) {  // <- native function

            const retVal = callee.apply(object, args)
            return prevCont(retVal)

          } else {

            var name = self.callee.object.name + '.' + self.callee.property.name

          }

        } else {

          if (global[callee.name]) {

            const retVal = callee(args)
            return prevCont(retVal)

          }
          var name = self.callee.name
        }

        var err = new TypeError(name + ' is not a function.')
        return prevErrCont('TypeError', err)

      }

    }

  }

  toAST() {
    var args = []
    for (var i = 0; i < this.arguments.length; i++) {
      args.push(this.arguments[i].toAST())
    }
    var callee = this.callee.toAST()

    return {
      type: this.type,
      arguments: args,
      callee: calle,
      start: this.start,
      end: this.end
    }
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

    if (this.extra && this.extra.parenthesized) this.nativeSource = '(' + callee + '(' + args + '))'
    else this.nativeSource = callee + '(' + args + ')' 
    
  }
}



