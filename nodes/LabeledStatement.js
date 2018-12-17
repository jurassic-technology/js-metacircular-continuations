import Node from './Node' 

export default class LabeledStatement extends Node {
  constructor (label, body) {
    super()
    this.type = 'LabeledStatement'
    this.label = label
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'label', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this

    return this.body.interpret(scope, prevCont, nextErrContLabel)

    function nextErrContLabel (errType, label, extra) {

      if (errType === 'BreakStatement') {
        if (label === self.label.name) {
          return prevCont(extra)
        } else {
          return prevErrCont.apply(null, arguments)
        }
      } else if (errType === 'ContinueStatement') {
        if (label === self.label.name) {
          // next cont continue from given block statement
          return extra()
        } else {
          return prevErrCont.apply(null, arguments)
        }
      } else {
        return prevErrCont.apply(null, arguments)
      }

    }

  }

  toAST () {
    var label = this.label.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      labe: label,
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
    var label = this.label.toNativeSource()
    var body = this.body.toNativeSource()

    this.nativeSource = label + ': ' + body

  }
}

