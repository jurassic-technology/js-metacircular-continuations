import Node from './Node' 

export default class UnaryExpression extends Node {

  constructor (operator, argument) {
    super()
    this.type = 'UnaryExpression'
    this.operator = operator
    this.argument = argument
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }

  interpret(scope, prevCont, prevErrCont) {

    var self = this, obj

    if (this.argument instanceof MemberExpression) {
      return this.argument.object.interpret(scope, nextContMemberObject, prevErrCont)
    } else {

      if (this.operator === 'typeof' && this.argument.type === 'Identifier' && !scope.has(this.argument.name)) {
        return prevCont('undefined')
      } else {
        return this.argument.interpret(scope, nextContArgument, prevErrCont)
      }


    }

    function nextContMemberObject (object) {

      obj = object
      if (self.argument.computed) {
        return self.argument.property.interpret(scope, nextContComputedProperty, prevErrCont)
      } else {
        return nextContArgument(null, object, self.argument.property.name)
      }

    }

    function nextContComputedProperty (property) {
      return nextContArgument(null, obj, property)
    }


    function nextContArgument (value, object, property) {

      var val

      if (object && self.operator == 'delete') {
        return prevCont(delete object[property])
      } else if (object) {
        val = object[propertyName]
      } else {
        val = value
      }

      if (self.operator === 'typeof') {

        if (val instanceof AsyncScope) {
          return prevCont('function')
        } else {
          return prevCont(typeof val)
        }

      } else if (self.operator === 'void') {
        return prevCont(undefined)
      } else if (self.operator === '+') {
        return prevCont(+val)
      } else if (self.operator === '-') {
        return prevCont(-val)
      } else if (self.operator === '~') {
        return prevCont(~val)
      } else if (self.operator === '!') {
        return prevCont(!val)
      }

    }

  }

  toAST() {

    var argument = this.argument.toAST()
    return {
      type: this.type,
      operator: this.operator,
      argument: argument
    }

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var argument = this.argument.toNativeSource()
    var source = this.operator + argument

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + source + ')'
    else
      this.nativeSource = source

  }

}
