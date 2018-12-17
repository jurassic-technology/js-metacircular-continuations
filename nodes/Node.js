export default class Node {
  constructor () {

  }

  setParens () {
    this.extra = { parenthesized: true }
  }

  transform (visitor, contextDeclaredVariables) {
    var manifest = new VisitorManifest(contextDeclaredVariables)
    this.applyTransform(visitor, manifest)
  }

  applyTransform (visitor, manifest) {

    if (this.briefVisitorManifest) this.briefVisitorManifest(manifest)

    var immanentVisitor = visitor[this.type]

    if (immanentVisitor) {
      if (immanentVisitor.enter) {
        immanentVisitor.enter.call(this, manifest)
      } else if (!immanentVisitor.exit) {
        immanentVisitor.call(this, manifest)
      }
    }

    this.transformVisitorRoute(visitor, manifest)

    if (immanentVisitor && immanentVisitor.exit) {
      immanentVisitor.exit.call(this, manifest)
    }

    if (this.debriefVisitorManifest) this.debriefVisitorManifest(manifest)

  }

  transformVisitorRoute (visitor, manifest) {

    for (var i = 0; i < this.TRAVERSAL_ROUTE.length; i++) {

      var routeKey = this.TRAVERSAL_ROUTE[i]

      if (this[routeKey]) {

        if (this[routeKey] instanceof Array) {

          for  (var j = 0; i < this[routeKey].length; j++) this[routeKey].applyTransform(visitor, manifest)

        } else {

          this[routeKey].applyTransform(visitor, manifest)

        }

      }
    }
  }

  getMetaData (passMetaData, encodeValue) {
    const TYPE = 0, PROPERTIES = 1

    var metaData = new Array()
    var id = passMetaData(this, Node.fromMetaData, metaData)

    metaData[TYPE] = this.type
    metaData[PROPERTIES] = new Array()
    for (var i = 0; i < this.TRAVERSAL_ROUTE.length; i++){
      var routeKey = this.TRAVERSAL_ROUTE[i]

      if (this[routeKey] instanceof Array) {

        var value = new Array()
        for (var j = 0; j < this[routeKey].length; j++) value.push(encodeValue(this[routeKey][j]))

      } else {

        var value = encodeValue(this[routeKey])

      }

      metaData[PROPERTIES].push(value)
    }

    return id
  }

  static fromMetaData (metaData, decodeValue, passObject) {
    const TYPE = 0, PROPERTIES = 1
    const type = metaData[TYPE]

    const properties = new Array()
    const evalArguments = new Array()
    for (var i = 0; i < metaData[PROPERTIES].length; i++){
      var value = decodeValue(metaData[PROPERTIES][i])
      evalArguments.push('properties[' + i + ']')
      properties.push(value)
    }

    var object = eval("new " + type + "(" + evalArguments.join(',') + ")")
    passObject(object)

    return object
  }
}


