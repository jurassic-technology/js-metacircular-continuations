import Node from './Node' 
import { interpretNodeArray } from './utilities/common'


export default class ObjectExpression extends Node {
  constructor (properties) {
    super()
    this.type = 'ObjectExpression'
    this.properties = properties
    this.TRAVERSAL_ROUTE = [ 'properties' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    return interpretNodeArray(this.properties, scope, nextContProperties, prevErrCont)

    function nextContProperties (results) {

      var obj = new Object()
      var assignArgs = [ obj ]

      for (var i = 0; i < self.properties.length; i++){

        var el = results[i]

        if (el instanceof AsyncScope) {

          var type = self.properties[i].kind
          var descriptor = { configurable: true }
          descriptor[ type ] = function () { el.setThisVar(this); return el }
          Object.defineProperty(obj, self.properties[i].key.name, descriptor)

        } else {

          assignArgs.push(el)

        }

      }

      obj = Object.assign.apply(null, assignArgs)

      return prevCont(obj)

    }
  }

  toAST() {
    var properties = []
    for (var i = 0; i < this.properties.length; i++) properties.push(this.properties[i].toAST())
    return {
      type: this.type,
      properties: properties,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var properties = ''
    for (var i = 0; i < this.properties.length; i++) {
      proprerties += this.properties[i].toNativeSource()
      if (i !== this.properties.length) {
        properties += ', '
      }
    }

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '({' + properties + '})'
    else
      this.nativeSource = '{' + properties + '}'

  }
}
