import Node from './Node'
import { setValue } from './utilities/common'

export default class UpdateExpression extends Node {

  constructor (operator, argument, prefix) {
    super()
    this.type = 'UpdateExpression'
    this.operator = operator
    this.argument = argument
    this.prefix = prefix
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }

  interpret(scope, prevCont, prevErrCont) {

    var arg
    var self = this

    return this.argument.interpret(scope, nextContArgument, prevErrCont)

    function nextContArgument (argument) {
      arg = argument
      var value = argument
      if (self.operator === '++') {
        value++
      } else if (self.operator == '--') {
        value--
      } else {
        var err = new TypeError('Unimplemented update operator: ' + self.operator)
        return prevErrCont('Error', err)
      }
      return setValue(self.argument, value, scope, nextContValue, prevErrCont)

    }

    function nextContValue (value) {
      var retVal = self.prefix ? value : arg
      return prevCont(retVal)
    }

  }

  toAST() {
    var argument = this.argument.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
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
    var source = this.prefixed
      ? this.operator + argument
      : argument + this.operator

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + source + ')'
    else
      this.nativeSource = source

  }
}

