import Node from './Node' 
import { resolveValue } from './utilities/common'

export class MemberExpression extends Node {
  constructor (object, property, computed) {
    super()
    this.type = 'MemberExpression'
    this.object = object
    this.property = property
    this.computed = computed
    this.TRAVERSAL_ROUTE = [ 'obejct', 'property' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var obj

    return this.object.interpret(scope, nextContObject, prevErrCont)

    function nextContObject (object) {

      var val

      obj = object

      if (self.property.type === 'Identifier' && !self.computed) {

        var descriptor = Object.getOwnPropertyDescriptor(obj, self.property.name)

        if (descriptor && descriptor.get) {

          var methodScope = descriptor.get()
          val = new Promise(function(resolve, reject) {
            return methodScope.interpret(resolve, reject)
          })

        } else {

          val = object[ self.property.name ]

        }

        return resolveValue(val, nextContResolveVal, prevErrCont)

      } else {

        return self.property.interpret(scope, nextContComputed, prevErrCont)

      }

    }

    function nextContComputed (propertyName) {

      var val, descriptor = Object.getOwnPropertyDescriptor(obj, propertyName)

      if (descriptor.get) {
        var methodScope = descriptor.get()
        val = new Promise(function (resolve, reject) {
          return methodScope.interpret(resolve, reject)
        })
      } else {
        val = obj[ propertyName ]
      }

      return resolveValue(val, nextContResolveVal, prevErrCont)

    }

    function nextContResolveVal (value) {
      return prevCont(value, obj, self.property.name)
    }

  }

  toAST () {
    var object = this.object.toAST()
    var property = this.property.toAST()
    return {
      type: this.type,
      object: object,
      property: property,
      computed: this.computed,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var object = this.object.toNativeSource()
    var property = this.property.toNativeSource()
    var expression = this.computed
      ? object + '[' + property + ']'
      : object + '.' + property

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + expression + ')'
    else
      this.nativeSource = expression
  }

}
