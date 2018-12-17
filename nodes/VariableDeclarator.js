import Node from './Node'

export default class VariableDeclarator extends Node {
  constructor (id, init) {
    super()
    this.type = 'VariableDeclarator'
    this.id = id
    if (init) this.init = init;
    this.TRAVERSAL_ROUTE = [ 'id', 'init' ]
  }


  interpret (scope, prevCont, prevErrCont) {

    var self = this

    if (this.init) {

      return this.init.interpret(scope, nextCont, prevErrCont)

    } else {

      return nextCont(undefined)

    }

    function nextCont (value) {

      scope.declare(self.id.name, value)
      return prevCont(value, self.id.name)

    }

  }

  toAST() {
    var id = this.id.toAST()
    var init = this.init ? this.init.toAST() : null
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      id: id,
      init: init
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var id = this.id.toNativeSource()
    var init = this.init
      ? ' = ' + this.init.toNativeSource()
      : ''

    this.nativeSource = id + init

  }

}


