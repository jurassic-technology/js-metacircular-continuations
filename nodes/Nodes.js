import _ from 'lodash'
import computeAssignmentExpression from './utilities/computeAssignmentExpression'
import computeBinaryExpression from './utilities/computeBinaryExpression'
import interpretNodeArray from './utilities/interpretNodeArray'
import { AsyncScope } from '../runtime'

export function callFunction (callee, thisObj, args, prevCont, prevErrCont) {
  try {

    if (callee instanceof Function) {
      var result = callee.apply(thisObj, args)
      resolveValue(result, prevCont, prevErrCont)
    } else {
      var err = new TypeError(typeof callee + ' is not a function') 
      return prevErrCont('Error', err)
    }   

  } catch (e) { 
    return prevErrCont(e)
  }   

}

export function resolveValue (value, prevCont, prevErrCont) {

  if (typeof value === 'object' && value instanceof Promise) {
    return value.then(prevCont, prevErrCont)
  } else {
    return prevCont(value)
  }

}

export function setValue (node, value, scope, prevCont, prevErrCont) {

  if (node.type === 'Identifier') {

    var success = scope.set(node.name, value);

    if (!success) {
      return prevErrCont("ReferenceError", new ReferenceError())
    } else {
      return prevCont(value)
    }

  } else if (node.type === 'MemberExpression') {

    var propertyName = node.computed ? node.property.value : node.property.name
    return node.object.interpret(scope, nextContObject, prevErrCont)
      
    function nextContObject (object) {

      var descriptor = Object.getOwnPropertyDescriptor(object, propertyName)
      if (descriptor && descriptor.set) {

        var methodScope = descriptor.set()
        var param = methodScope.program.params[0].name
        methodScope.set(param, value)

        return resolveValue( 
          new Promise(function (resolve, reject) { return methodScope.interpret(resolve, reject) })
        )

      } else {

        object[propertyName] = value
        return resolveValue(value, prevCont, prevErrCont)  

      }

    }

  }
}

export class Node {
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

          for  (var j = 0; i < this[routeKey].length; j++) {

            this[routeKey].applyTransform(visitor, manifest)

          }

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
        for (var j = 0; j < this[routeKey].length; j++) {
          value.push(encodeValue(this[routeKey][j]))
        }
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


export class ArrayExpression extends Node {
  constructor (elements) {
    super()
    this.type = 'ArrayExpression'
    this.elements = elements
    this.TRAVERSAL_ROUTE = [ 'elements' ]
  }


  interpret (scope, prevCont, prevErrCont) {

    function nextCont () {
      return prevCont.apply(null, arguments)
    }
    return interpretNodeArray(this.elements, scope, nextCont, prevCont)

  }

  toAST() {

    var elements = [] 
    for (var i = 0; i < this.elements.length; i++) {
      elements.push(this.elements[i].toAst())
    } 

    return {
      type: this.type,
      elements: elements,
      start: this.start,
      end: this.end
    }

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var elements = ''
    for (var i = 0; i < this.elements.length; i++){
      elements += this.elements[i].toNativeSource()
      if (i !== this.elements.length){
        elements += ', '
      }
    }

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '([' + elements + '])'
    else
      this.nativeSource = '[' + elements + ']'

  }

}

export class AssignmentExpression extends Node {
  constructor (operator, left, right) {
    super()
    this.type = 'AssignmentExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }

  interpret (scope, prevCont, prevErrCont) {


    var self = this
    var rightVal

    return this.right.interpret(scope, nextContRight, prevErrCont)
    
    function nextContRight (right) {
      rightVal = right
      if (self.operator == '=') {
        return setValue(self.left, right, scope, prevCont, prevErrCont) 
      } else {
        self.left.interpret(scope, nextContLeft, prevErrCont) 
      }
    }

    function nextContLeft (left) {
      var value = computeAssignmentExpression(left, rightVal, self.operator) 
      if (value instanceof Error) {
        prevErrCont(new Error('Invalid operator: ' + self.operator))
      } else {
        return setValue(self.left, value, scope, prevCont, prevErrCont) 
      }
    }

  }

  toAST () {
    var left = this.left.toAST()
    var right = this.right.toAST()

    return {
      type: this.type,
      operator: this.operator,
      left: left,
      right: right,
      start: this.start,
      end: this.end
    } 
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var left = this.left.toNativeSource()
    var right = this.right.toNativeSource()
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + left + this.operator + right + ')'
    else
      this.nativeSource = left + ' ' + this.operator + ' ' + right

  }
}

export class BinaryExpression extends Node {
  constructor (operator, left, right) {
    super()
    this.type = 'BinaryExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }
  
  interpret (scope, prevCont, prevErrCont) {


    var self = this
    var leftVal 
    

    return this.left.interpret(scope, nextContLeft, prevErrCont)

    function nextContLeft (left) {
      leftVal = left
      return self.right.interpret(scope, nextContRight, prevErrCont)
    }

    function nextContRight (right) {
      var value = computeBinaryExpression(leftVal, right, self.operator) 
      if (value instanceof Error) {
        return prevErrCont('Error', new Error('Invalid operator: ' + self.operator))
      } else {
        return prevCont(value)
      }
    }

  }


  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()
    return {
      type: this.type,
      left: left,
      right: right,
      operator: this.operator,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var left = this.left.toNativeSource()
    var right = this.right.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + left + ' ' + this.operator + ' ' + right + ')'
    else
      this.nativeSource = left + ' ' + this.operator + ' ' + right

  }
}


export class BlockStatement extends Node {

  constructor (body) {
    super()
    this.type = 'BlockStatement'
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.body, scope, nextCont, nextErrCont)

    function nextCont (results) {
      return prevCont(results[ results.length - 1]) 
    }

    function nextErrCont (errType, result) {

      switch(errType) {
        case 'ContinueStatement':
        case 'BreakStatement':
          return prevErrCont.apply(null, arguments) 
        case 'ReturnStatement':
          return prevCont(result, true) 
        case 'ReferenceError': 
        case 'ThrowStatement':
        case 'Error':
          return prevErrCont.apply(null, arguments)
        // When is the default clause ever hit and 
        // why does it call the continuation and not errorContinuation
        default: 
          return prevCont.apply(null, arguments) 
      }
    }

  }

  toAST() {

    var body = []
    for (var i = 0; i < this.body.length; i++){
      body.push(this.body[i].toAST())
    }

    return {
      type: this.type,
      body: body,
      start: this.start,
      end: this.end
    }

  }

  prependChild (node) {
    this.body.unshift(node) 
  }

  appendChild (node) {
    this.body.push(node)
  }
    
  removeChild (node) {
    var childIndex = this.body.indexOf(node)
    if (childIndex >= 0) this.body.splice(childIndex, 1) 
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.indexOf(target) 
    if (childIndex >= 0) this.body.splice(childIndex, 1, replacement)
  } 

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var blockBody = ''
    for (var i = 0; i < this.body.length; i++){
      blockBody += this.body[i].toNativeSource() 
      if (i !== this.body.length) {
        blockBody += " " 
      }
    }

    var body = '{ ' + blockBody + ' }'

    this.nativeSource = body
  }
}


export class BooleanLiteral extends Node {
  constructor (value, start, end) {
    super()
    this.type = 'BooleanLiteral'
    this.value = value
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont) {
    return prevCont(this.value)
  }

  toAST () {
    return {
      type: this.type,
      value: this.value,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + this.value.toString() + ')'
    else
      this.nativeSource = this.value.toString()
  }
}

export class BreakStatement extends Node {
  constructor (label) {
    super()
    this.type = 'BreakStatement'
    this.label = label
    this.TRAVERSAL_ROUTE = [ 'label' ]
  }

  interpret (scope, prevCont, prevErrCont) {
    
    var label = this.label ? this.label.name : undefined
    return prevErrCont('BreakStatement', label) 

  }

  toAST() {
    var label = this.label.toAST()
    return {
      type: this.type,
      label: label,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var label = this.label ? ' ' + this.label.toNativeSource() : ''
    this.nativeSource = 'break' + label + ';'
  }
}

export class CallExpression extends Node {
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

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + callee + '(' + args + '))'
    else
      this.nativeSource = callee + '(' + args + ')'

  }
}

export class CatchClause extends Node {

  constructor (param, body) {
    super()
    this.type = 'CatchClause'
    this.param = param
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'param', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return this.body.interpret(scope, prevCont, prevErrCont) 

  }

  prependChild (node) {
    this.body.body.unshift(node) 
  }

  appendChild (node) {
    this.body.body.push(node)
  }
    
  removeChild (node) {
    var childIndex = this.body.body.indexOf(node)
    if (childIndex >= 0) this.body.body.splice(childIndex, 1) 
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.body.indexOf(target) 
    if (childIndex >= 0) this.body.body.splice(childIndex, 1, replacement)
  } 

  toAST() {
    var param = this.param.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      param: param,
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
    var param = this.param.toNativeSource()
    var body = this.body.toNativeSource()
    this.nativeSource =  'catch (' + param + ') ' + body
  }
}


export class ConditionalExpression extends Node {
  constructor (test, consequent, alternate) {
    super()
    this.type = 'ConditionalExpression'
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
    this.TRAVERSAL_ROUTE = [ 'test', 'consequent', 'alternate' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this

    return this.test.interpret(scope, nextContTest, prevErrCont)

    function nextContTest (test) {
      if (test) {
        return self.consequent.interpret(scope, prevCont, prevErrCont)
      } else {
        return self.alternate.interpret(scope, prevCont, prevErrCont)
      }
    }

  }

  toAST() {
    var test = this.test.toAST()
    var consequent = this.consequent.toAST()
    var alternate = this.alternate.toAST()
    return {
      type: this.type,
      test: test,
      consequent: consequent,
      alternate: alternate,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var test = this.test.toNativeSource()
    var consequent = this.consequent.toNativeSource()
    var alternate = this.alternate.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + test + ' ? ' + consequent + ' : ' + alternate + ')'
    else
      this.nativeSource = test + ' ? ' + consequent + ' : ' + alternate

  }
}

export class ContinueStatement extends Node {
  constructor (label) {
    super()
    this.type = 'ContinueStatement'
    this.label = label
    this.TRAVERSAL_ROUTE = [ 'label' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var label = this.label ? this.label.name : undefined
    return prevErrCont('ContinueStatement', label) 

  }

  toAST() {
    var label = this.label.toAST()
    return {
      type: this.type,
      label: label,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var label = this.label ? this.label.toNativeSource() : ''
    this.nativeSource = 'continue ' + label + ';'
  }
}


export class DoWhileStatement extends Node {
  constructor (test, body) {
    super()
    this.type = 'DoWhileStatement'
    this.test = test
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'body', 'test' ]
  }

  interpret (scope, prevCont, prevErrCont) {
    
    var lastResult
    var self = this

    return this.body.interpret(scope, nextContBody, prevErrCont) 

    function nextContBody (result) {

      lastResult = result
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
            return self.test.interpret(scope, nextContTest, prevErrCont) 
          } else {
            return self.test.interpret(scope, nextContTest, prevErrCont) 
          }
        default:
          return prevErrCont.apply(null, arguments) 
      }
    }

    function nextContTest (test) {

      if (test) {
        return self.body.interpret(scope, nextContBody, nextErrContBody) 
      } else {
        return prevCont(lastResult)
      }

    }

  }

  toAST () {
    var test = this.test.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      test: test,
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
    var test = this.test.toNativeSource()
    var body = this.body.toNativeSource()
    this.nativeSource =  'do ' + body + ' while (' + test + ')'
  }

}

export class ExpressionStatement extends Node {
  constructor(expression) {
    super()
    this.type = 'ExpressionStatement'
    this.expression = expression
    this.TRAVERSAL_ROUTE = [ 'expression' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return this.expression.interpret(scope, prevCont, prevErrCont) 

  }

  toAST() {
    var ast = {
      expression: this.expression.toAST(),
      type: this.type,
      start: this.start,
      end: this.end
    }

    if (this.extra) { 
      ast.extra = this.extra
    } 

    return ast

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var source = this.expression.toNativeSource()
    if (source.charAt(source.length - 1) !== ';') source += ';'
    this.nativeSource = source
  }
}

export class ForInStatement extends Node {
  constructor (left, right, body) {
    super()
    this.type = 'ForInStatement'
    this.left = left
    this.right = right
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'left', 'right', 'body' ] 
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, iterables = [], lastResult; 

    const left = this.left.type === 'VariableDeclaration' 
      ? this.left.declarations[0].id
      : this.left
    
    scope.declare(left.name, undefined) 

    return this.right.interpret(scope, nextContRight, prevErrCont)

    function nextContRight (right) {

      iterables = Object.keys(right)
      if (iterables.length) {
        const leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)
      } else {
        return prevCont()
      }

    }

    function getLeftSetter (value) {
      const rightNode = new StringLiteral(value)
      return new AssignmentExpression('=', left, rightNode) 
    }

    function nextContInitBodyLoop () {
      return self.body.interpret(scope, nextContLoopBody, nextErrContBody)
    }

    function nextContLoopBody (result, doNotSetLastResult) {

      if (!doNotSetLastResult) {
        lastResult = result
      } 

      if (iterables.length) {
        var leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)
      } else {
        return prevCont(lastResult)
      }

    }

    function nextErrContBody (errType, value, extra) {
      switch (errType) {
        case 'BreakStatement': 
          if (typeof value === 'undefined') {
            return prevCont()
          } else {
            return prevErrCont(errType, value)
          }
        case 'ContinueStatement': 
          if (typeof value === 'undefined') {
            return nextContLoopBody(undefined, true)
          } else {
            return prevErrCont(errType, value)
          }
        case 'ReturnStatement':
        default: 
          return prevErrCont.apply(null, arguments) 
      }
    }
  }

  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      left: left,
      right: right,
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
    var left = this.left.toNativeSource()
    if (left.charAt(left.length - 1) == ';') left = left.slice(0, left.length - 1)
    var right = this.right.toNativeSource()
    var body = this.body.toNativeSource()
    return 'for (' + left + ' in ' + right + ') ' + body
  }

}

export class ForOfStatement extends Node {
  constructor (left, right, body) {
    super()
    this.type = 'ForOfStatement'
    this.left = left
    this.right = right
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'left', 'right', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, iterables = [], lastResult;

    const left = this.left.type === 'VariableDeclaration' 
      ? this.left.declarations[0].id
      : this.left

    scope.declare(left.name, undefined) 

    return this.right.interpret(scope, nextContRight, prevErrCont)

    function nextContRight (right) {

      for (var i = 0; i < right.length; i++) {
        iterables.push(right[i])
      }

      if (iterables.length) {

        const leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)

      } else {
        return prevCont()
      }

    }

    function getLeftSetter (value) {
      const rightNode = new StringLiteral(value) 
      return new AssignmentExpression('=', left, rightNode) 
    }

    function nextContInitBodyLoop () {
      return self.body.interpret(scope, nextContLoopBody, nextErrContBody)
    }

    function nextContLoopBody (result) {

      lastResult = result
      if (iterables.length) {
        const leftNode = getLeftSetter(iterables.shift())
        return leftNode.interpret(scope, nextContInitBodyLoop, prevErrCont)
      } else {
        return prevCont(lastResult)
      }

    }

    function nextErrContBody (errType, value, extra) {

      switch (errType) {
        case 'BreakStatement': 
          if (typeof value === 'undefined') {
            return prevCont()
          } else {
            return prevErrCont(errType, value)
          }
        case 'ContinueStatement': 
          if (typeof value === 'undefined') {
            return nextContLoopBody(undefined, true)
          } else {
            return prevErrCont(errType, value)
          }
        case 'ReturnStatement':
        default: 
          return prevErrCont.apply(null, arguments) 
      }

    }

  }

  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()
    var body = this.body.toAST()
    return {
      left: left,
      right: right,
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
    var left = this.left.toNativeSource()
    if (left.charAt(left.length - 1) == ';') left = left.slice(0, left.length - 1)
    var right = this.right.toNativeSource()
    var body = this.body.toNativeSource()
    return 'for (' + left + ' of ' + right + ') ' + body
  }
}

export class ForStatement extends Node {
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

export class FunctionDeclaration extends Node {
  constructor (id, params, body) {
    super()
    this.type = 'FunctionDeclaration'
    this.id = id
    this.params = params.length ? params : [] 
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'id', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var newScope = scope.newAsyncScope(this.body) 

    var params = [ ]
    if (this.params.length) { 
      for (var i = 0; i < this.params.length; i++) {
        params.push(this.params[i].name)  
      } 
    } 

    newScope.setParameters(params) 

    scope.declare(this.id.name, newScope)

    return prevCont(newScope) 

  }

  prependChild (node) {
    this.body.body.unshift(node) 
  }

  appendChild (node) {
    this.body.body.push(node)
  }
    
  removeChild (node) {
    var childIndex = this.body.body.indexOf(node)
    if (childIndex >= 0) this.body.body.splice(childIndex, 1) 
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.body.indexOf(target) 
    if (childIndex >= 0) this.body.body.splice(childIndex, 1, replacement)
  } 

  toAST() {
    var id = this.id.toAST()

    var params = [] 
    for (var i = 0; i < this.params.length; i++){
      params.push(this.params[i].toAST())
    }

    var body = this.body.toAST()
    return {
      type: this.type,
      id: id,
      params: params,
      body: body,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource();
    return this.nativeSource
  }

  setNativeSource () {
    var id = this.id.toNativeSource()
    var params = ''
    for (var i = 0; i < this.params.length; i++){
      params += this.params[i].toNativeSource()
      if (i !== this.params.length){
        params += ','
      }
    }
    var body = this.body.toNativeSource()
    this.nativeSource = 'function ' + id + ' (' + params + ') ' + body
  }
}

export class FunctionExpression extends Node {
  constructor (id, params, body) {
    super()
    this.type = 'FunctionExpression'
    this.id = id
    this.params = params
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'id', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {
    
    var newScope = new AsyncScope(this.body, scope) 

    var params = [ ]
    if (this.params.length) { 
      for (var i = 0; i < this.params.length; i++) {
        params.push(this.params[i].name)  
      } 
    } 
    newScope.setParameters(params) 

    if (this.id) { 
      newScope.declare(this.id.name, newScope)
    }

    return prevCont(newScope) 

  }

  prependChild (node) {
    this.body.body.unshift(node) 
  }

  appendChild (node) {
    this.body.body.push(node)
  }
    
  removeChild (node) {
    var childIndex = this.body.body.indexOf(node)
    if (childIndex >= 0) this.body.body.splice(childIndex, 1) 
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.body.indexOf(target) 
    if (childIndex >= 0) this.body.body.splice(childIndex, 1, replacement)
  } 

  toAST() {
    var id = this.id ? this.id.toAST() : undefined
    var params = [] 
    for (var i = 0; i < this.params.length; i++) {
      params.push(this.params[i].toAST())
    } 
    var body = this.body.toAST()
    return {
      type: this.type,
      id: id,
      params: params,
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
    var id = this.id ? this.id.toNativeSource() + ' ' : ''

    var params = ''
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].toNativeSource()
      if (i !== this.params.length) {
        params += ','
      } 
    } 

    var body = this.body.toNativeSource()

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(function ' + id + '(' + params + ') ' + body + ')'
    else
      this.nativeSource = 'function ' + id + '(' + params + ') ' + body 
  }

}


export class Identifier extends Node {
  constructor (name) {
    super()
    this.type = 'Identifier'
    this.name = name
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var value

    if (this.name == 'undefined') {
      return resolveValue(undefined, prevCont, prevErrCont)
    } else if (this.name == 'eval') {
    // TODO: What is happening here?
      return this.eval
    } else {
      if (scope.has(this.name)){
        value = scope.get(this.name) 
        return resolveValue(value, prevCont, prevErrCont) 
      } else {
        // return prevCont(undefined)
        var err = new ReferenceError(this.name + ' is not declared.')
        return prevErrCont('ReferenceError', err)
      }
       
    }

  }

  toAST() {
    return {
      type: this.type,
      name: this.name,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + this.name + ')'
    else
      this.nativeSource = this.name
  }
}

export class IfStatement extends Node {
  constructor (test, consequent, alternate) {
    super()
    this.type = 'IfStatement'
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
    this.TRAVERSAL_ROUTE = [ 'test', 'consequent', 'alternate' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    return this.test.interpret(scope, nextContTest, prevErrCont)

    function nextContTest (test) {
      if (test) {
        return self.consequent.interpret(scope, prevCont, prevErrCont)
      } else if (self.alternate) {
        return self.alternate.interpret(scope, prevCont, prevErrCont)
      } else {
        return prevCont() 
      }
    }

  }

  toAST () {
    var test = this.test.toAST()
    var consequent = this.consequent.toAST()
    var alternate = this.alternate.toAST()
    return {
      type: this.type,
      test: test,
      consequent: consequent,
      alternate: alternate,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var test = this.test.toNativeSource()
    var consequent = this.consequent.toNativeSource()
    var alternate = this.alternate
      ? ' else ' + this.alternate.toNativeSource()
      : ''

    this.nativeSource = 'if (' + test + ') ' + consequent + alternate

  }
}

export class LabeledStatement extends Node {
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

export class LogicalExpression extends Node {
  constructor (operator, left, right) {
    super()
    this.type = 'LogicalExpression'
    this.operator = operator
    this.left = left
    this.right = right
    this.TRAVERSAL_ROUTE = [ 'left', 'right' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, leftVal

    return this.left.interpret(scope, nextContLeft, prevErrCont)

    function nextContLeft (left) {
      leftVal = left
      if (!left && self.operator === '&&') {
        return prevCont(left)
      } else if (left && self.operator === '||') {
        return prevCont(left)
      } else {
        return self.right.interpret(scope, nextContRight, prevErrCont)
      }
    }

    function nextContRight (right) {
      if (self.operator === '&&') {
        return prevCont(leftVal && right) 
      } else if (self.operator === '||') {
        return prevCont(leftVal || right)
      } else {
        var err = new SyntaxError('Logical operator "' + self.operator + '" not supported')
        return prevErrCont(err)
      }
    }

  }

  toAST() {
    var left = this.left.toAST()
    var right = this.right.toAST()

    return {
      type: this.type,
      operator: this.operator,
      left: left,
      right: right,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource() {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var left = this.left.toNativeSource()
    var right = this.right.toNativeSource()
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + left + ' ' + this.operator + ' ' + right + ')'
    else
      this.nativeSource = left + ' ' + this.operator + ' ' + right
  }
}

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

export class NewExpression extends Node {

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


export class NullLiteral extends Node {
  constructor () {
    super()
    this.type = 'NullLiteral'
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont) {
    return prevCont(null)
  }

  toAST () {
    return {
      type: this.type,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(null)'
    else
      this.nativeSource = 'null'
  }
}

export class NumericLiteral extends Node {
  constructor (value) {
    super()
    this.type = 'NumericLiteral'
    this.value = value
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont) {
    return prevCont(Number(this.value))
  }

  toAST () {
    return {
      type: this.type,
      value: this.value,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + this.value.toString() + ')'
    else
      this.nativeSource = this.value.toString()
  }
}

export class ObjectExpression extends Node {
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

export class ObjectMethod extends Node {
  
  constructor (kind, key, params, body) {
    super()
    this.type = 'ObjectMethod'
    this.key = key
    this.kind = kind
    this.params = params
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'key', 'params', 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var method = new FunctionExpression(null, self.params, self.body)
    var methodScope = scope.newAsyncScope(method)
    return prevCont(methodScope)

  } 
  
  toAST() {
    var key = this.key.toAST()
    var params = [ ]
    for (var i = 0; i < this.params.length; i++) params.push(this.params[i].toAST()) 
    var body = this.body.toAST()
    return {
      key: key,
      params: params,
      body: body,
      kind: this.kind
    }

  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var key = this.key.toNativeSource()
    var params = ''
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].toNativeSource()
      if (i !== this.params.length) {
        params += ', '
      }
    }
    var body = this.body.toNativeSource()
    this.nativeSource = this.kind + key + ' (' + params + ') ' + body
  }
}

export class ObjectProperty extends Node {
  constructor (key, value, computed) {
    super()
    this.type = 'ObjectProperty'
    this.key = key
    this.value = value
    this.computed = computed
    this.TRAVERSAL_ROUTE = [ 'key', 'value' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this
    var obj = new Object()
    var propKey

    if (this.computed) {
      return this.key.interpret(scope, nextContKey, prevErrCont)
    } else {
      return nextContKey(this.key.name) 
    }

    function nextContKey (key) {
      propKey = key
      return self.value.interpret(scope, nextContValue, prevErrCont) 
    }

    function nextContValue (value) {
      obj[propKey] = value
      return prevCont(obj)
    }

  }

  toAST() {
    var key = this.key.toAST()
    var value = this.value.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      key: key,
      value: value
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var key = this.key.toNativeSource()
    var value = this.value.toNativeSource()
    this.nativeSource = key + ': ' + value
  }

}

export class Program extends Node {
  constructor (body) {
    super()
    this.type = 'Program'
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'body' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.body, scope, nextCont, nextErrCont) 

    function nextCont (results) {
      return prevCont(results[ results.length - 1 ]) 
    }

    function nextErrCont (errorType, result) {
      switch (errorType) {
        case 'ContinueStatement':
        case 'BreakStatement':
          return prevErrCont.apply(null, arguments) 
        case 'ReturnStatement':
          return prevCont(result) 
        case 'ReferenceError': 
        case 'ThrowStatement':
        case 'Error':
          return prevErrCont(result)
        // When is the default clause ever hit and 
        // Why does it call the continuation and not errorContinuation
        default: 
          return prevCont.apply(null, arguments) 
      }
    }

  } 

  prependChild (node) {
    this.body.unshift(node) 
  }

  appendChild (node) {
    this.body.push(node)
  }
    
  removeChild (node) {
    var childIndex = this.body.indexOf(node)
    if (childIndex >= 0) this.body.splice(childIndex, 1) 
  }

  replaceChild (target, replacement) {
    var childIndex = this.body.indexOf(target) 
    if (childIndex >= 0) this.body.splice(childIndex, 1, replacement)
  } 

  toAST () {
    var body = [] 
    for (var i = 0; i < this.body.length; i++) body.push(this.body[i].toAST())
    return {
      type: this.type,
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
    var source = ''
    for (var i = 0; i < this.body.length; i++) {
      source += this.body[i].toNativeSource()
      if (i !== this.body.length) {
        source += ' ' 
      } 
    } 

    this.nativeSource = source

  }
}

export class RegExpLiteral extends Node {
  constructor (pattern, flags) {
    super()
    this.type = 'RegularExpressionLiteral'
    this.pattern = pattern
    this.flags = flags
    this.TRAVERSAL_ROUTE = [ ] 
  }

  interpret (scope, prevCont) {
    var regex = new RegExp(this.pattern, this.flags)  
    return prevCont(regex) 
  }


  toAST() {
    var pattern = this.pattern.toAST()
    var flags = this.flags.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      patter: pattern,
      flags: flags
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = "(/" + this.pattern + "/" + this.flags + ')'
    else
      this.nativeSource = "/" + this.pattern + "/" + this.flags

  }
}

export class ReturnStatement extends Node {
  constructor (argument) {
    super()
    this.type = 'ReturnStatement'
    this.argument = argument
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    if (this.argument) {
      return this.argument.interpret(scope, nextCont, prevErrCont)
    } else {
      return prevErrCont(this.type)
    }

    function nextCont (argument) {
      return prevErrCont('ReturnStatement', argument)
    }

  }

  toAST() {
    var argument = this.argument.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      argument: argument
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var argument = this.argument
      ? this.argument.toNativeSource()
      : ''

    this.nativeSource = 'return ' + argument + ';'

  }
}

export class SequenceExpression extends Node {
  constructor (expressions) {
    super()
    this.type = 'SequenceExpression'
    this.expressions = expressions
    this.TRAVERSAL_ROUTE = [ 'expressions' ]
  }

  interpret (scope, prevCont, errCont) {

    interpretNodeArray(this.expressions, scope, nextCont, errCont) 

    function nextCont (results) {

      return prevCont(results[ results.length - 1 ])

    }

  }

  toAST() {

    var expressions = []
    for (var i = 0; i < this.expressions.length; i++){
      expressions.push(this.expressions[i].toAst())
    } 

    return {
      type: this.type,
      start: this.start,
      end: this.end,
      expressions: expressions
    }

  }

  toNativeSource (type) {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var expressions = ''
    for (var i = 0; i < this.expressions.length; i++){
      expressions += this.expressions[i].toNativeSource()
      if (i !== this.expressions.length) {
        expressions += ', '
      }
    }

    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(' + expressions + ')' + ';'
    else
      this.nativeSource = expressions + ';'

  }

}

export class StringLiteral extends Node {
  constructor (value) {
    super()
    this.type = 'StringLiteral'
    this.value = value
    this.TRAVERSAL_ROUTE = [ ]
  }


  interpret (scope, prevCont) {

    return prevCont(this.value)

  }

  toAST () {
    return {
      type: this.type,
      value: this.value,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '("' + this.value + '")'
    else
      this.nativeSource = '"' + this.value + '"'
  }

}

export class SwitchCase extends Node {
  constructor (test, consequent) {
    super()
    this.type = 'SwitchCase'
    this.test = test
    this.consequent = consequent
    this.TRAVERSAL_ROUTE = [ 'test', 'consequent' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.consequent, scope, prevCont, prevErrCont) 

  } 

  toAST() {
    var test = this.test.toAST()

    var consequent = [] 
    
    for (var i = 0; i < this.consequent.length; i++){
      consequent.push(this.consequent[i].toAST())
    }

    return {
      type: this.type,
      start: this.start,
      end: this.end,
      test: test,
      consequent: consequent
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var test = this.test
      ? this.test.toNativeSource()
      : ''

    var consequent = ''
    for (var i = 0; i < this.consequent.length; i++){
      consequent += this.consequent[i].toNativeSource()
      if (i !== this.consequent.length) {
        consequent += ' '
      }
    }

    if (test.length)
      this.nativeSource = 'case ' + test + ': ' + consequent
    else
      this.nativeSource = 'default: ' + consequent

  }
}


export class SwitchStatement extends Node {
  constructor (discriminant, cases) {
    super()
    this.type = 'SwitchStatement'
    this.discriminant = discriminant
    this.cases = cases
    this.TRAVERSAL_ROUTE = [ 'discriminant', 'cases' ]
  }


  interpret (scope, prevCont, prevErrCont) {

    var cases

    return this.discriminant.interpret(scope, nextContDiscriminant, prevErrCont) 

    function nextContDiscriminant (discriminant) {

      for (var i = 0; i < this.cases.length; i++) {
        const test = this.cases[i].test.type === 'Identifier'
          ? this.cases[i].test.name === discriminant
          : this.cases[i].test.value === discriminant
        
        if (this.cases[i].test === null) {
          cases = this.cases.slice(i)
        }

        if (discriminant) {
          cases = this.cases.slice(i)
          break
        }
      }

      return interpretNodeArray(cases, scope, prevCont, nextErrContBreak)

    }

    function nextErrContBreak (errType, value) {
      if (errType === 'BreakStatement') {
        return prevCont(value)
      } else {
        return prevErrCont.apply(null, arguments)
      }
    }

  } 

  toAST() {
    var cases = [] 
    for (var i = 0; i < this.cases.length; i++) cases.push(this.cases[i].toAST())
    var discriminant = this.discriminant.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      cases: cases,
      discriminant: discriminant
    }
  } 

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {

    var discriminant = this.discriminant.toNativeSource()

    var casesBody = ''
    for (var i = 0; i < this.cases.length; i++) {
      casesBody += this.cases[i].toNativeSource()
      if (i !== this.cases.length) {
        casesBody += ' '
      }
    }
    var cases = '{ ' + casesBody + ' }'

    this.nativeSource = 'switch (' + discriminant + ') ' + cases

  }
}

export class ThisExpression extends Node {
  constructor () {
    super()
    this.type = 'ThisExpression'
    this.TRAVERSAL_ROUTE = [ ]
  }

  interpret (scope, prevCont, prevErrCont) {
    return prevCont(scope.this)
  }

  toAST() {
    return {
      type: this.type,
      start: this.start,
      end: this.end
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }


  setNativeSource () {
    if (this.extra && this.extra.parenthesized)
      this.nativeSource = '(this)'
    else
      this.nativeSource = 'this'
  }
}


export class ThrowStatement extends Node {
  constructor (argument) {
    super()
    this.type = 'ThrowStatement'
    this.argument = argument
    this.TRAVERSAL_ROUTE = [ 'argument' ]
  }


  interpret (scope, prevCont, prevErrCont) {

    return this.argument.interpret(scope, nextCont, prevErrCont)

    function nextCont (argument) {
      return prevErrCont('ThrowStatement', argument) 
    }

  }

  toAST() {
    var argument = this.argument.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      argument: argument
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var argument = this.argument.toNativeSource()
    this.nativeSource = 'throw(' + argument +')'
  }
}

export class TryStatement extends Node {
  constructor (block, handler, finalizer) {
    super()
    this.type = 'TryStatement'
    this.block = block
    this.handler = handler
    this.finalizer = finalizer
    this.TRAVERSAL_ROUTE = [ 'block', 'handler', 'finalizer' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    var self = this, tryValue
    
    return this.block.interpret(scope, nextContTry, nextContInvokeCatchOrFinally)

    function nextContTry (tryVal) {
      tryValue = tryVal
      if (self.finalizer) {
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont) 
      } else {
        return prevCont(tryValue)
      }
    }

    function nextContInvokeCatchOrFinally (error) {

      if (self.handler) {

        var handlerScope = scope.newAsyncScope(self.handler) 
        handlerScope.declare(self.handler.param.name, arguments[1]) 
        return handlerScope.interpret(nextContCatch, prevErrCont) 

      } else if (self.finalizer) {
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont)
      }

    }

    function nextContCatch (value, isReturn) {
      
      if (isReturn) {
        return prevErrCont('ReturnStatement', value) 
      } else if (self.finalizer) {
        tryValue = value
        return self.finalizer.interpret(scope, nextContFinally, prevErrCont)
      } else {
        return prevCont(value)
      }

    }

    function nextContFinally (finalizerValue) {

      var contValue = finalizerValue 
        ? finalizerValue
        : tryValue

      return prevCont(contValue)
      
    }

  }

  toAST() {
    var handler = this.handler.toAST()
    var block = this.block.toAST()
    var finalizer = this.finalizer.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      block: block,
      handler: handler,
      finalizer: finalizer
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var block = this.block.toNativeSource()
    var handler = this.handler ? ' ' + this.handler.toNativeSource() : ''
    var finalizer = this.finalizer ? ' finally ' + this.finalizer.toNativeSource() : ''
    this.nativeSource = 'try ' + block + handler + finalizer
  }

}

export class UnaryExpression extends Node {

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

export class UpdateExpression extends Node {

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

export class VariableDeclaration extends Node {
  constructor (declarations, kind) {
    super()
    this.type = 'VariableDeclaration'
    this.declarations = declarations
    this.kind = kind
    this.TRAVERSAL_ROUTE = [ 'declarations' ]
  }

  interpret (scope, prevCont, prevErrCont) {

    return interpretNodeArray(this.declarations, scope, nextContDeclarators, prevErrCont) 
    
    function nextContDeclarators () {
      return prevCont()
    }

  } 

  toAST() {
    var declarations = [] 
    for (var i = 0; i < this.declarations.length; i++){
      declarations.push(this.declarations[i].toAST())
    }
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      declarations: declarations
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var declarations = ''
    for (var i = 0; i < this.declarations.length; i++) {
      declarations += this.declarations[i].toNativeSource()
      if (i !== this.declarations.length) {
        declarations += ', '
      }
    }

    this.nativeSource = 'var ' + declarations + ';' 
  }
}

export class VariableDeclarator extends Node {
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


export class WhileStatement extends Node {
  constructor (test, body) {
    super()
    this.type = 'WhileStatement'
    this.test = test
    this.body = body
    this.TRAVERSAL_ROUTE = [ 'test', 'body' ]
  }


  interpret (scope, prevCont, prevErrCont) {
    
    var lastResult
    var self = this

    return this.test.interpret(scope, nextContTest, prevErrCont) 

    function nextContTest (test) {

      if (test) {
        return self.body.interpret(scope, nextContBody, nextErrContBody) 
      } else {
        return prevCont(lastResult)
      }

    }

    function nextContBody (result) {
      lastResult = result
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
            return self.test.interpret(scope, nextContTest, prevErrCont) 
          } else {
            return self.test.interpret(scope, nextContTest, prevErrCont) 
          }
        default:
          return prevErrCont.apply(null, arguments) 
      }
    }
  }

  toAST() {
    var test = this.test.toAST()
    var body = this.body.toAST()
    return {
      type: this.type,
      start: this.start,
      end: this.end,
      test: test,
      body: body
    }
  }

  toNativeSource () {
    this.setNativeSource()
    return this.nativeSource
  }

  setNativeSource () {
    var test = this.test.toNativeSource()
    var body = this.body.toNativeSource()
    this.nativeSource = 'while (' + test + ') ' + body
  }

}

export class VisitorManifest {

  constructor (contextDeclaredVariables) {

    this.contextDeclaredVariables = contextDeclaredVariables
    this.scopes = [ ] 
    this.blocks = [ ] 

  } 

  pushNewBlock () {

    this.blocks.push(new Block())

  } 

  popBlock () {
    
    this.blocks.pop()

  } 

  pushNewScope () {
   
    if (this.contextDeclaredVariables) {
    
      var newScope = new Scope(this.scopes[ this.scopes.length - 1 ], this.contextDeclaredVariables)
      delete this.contextDeclaredVariables
    
    } else {
     
      var newScope = new Scope(this.scopes[ this.scopes.length - 1 ], null)

    }

    this.scopes.push(newScope)

  } 

  popScope() {
    this.scopes.pop()
  }

  prepareHoisting (nodeToHoist) {

    var hoistingScope = this.scopes[ this.scopes.length - 1 ]
    var mutatingBlock = this.blocks[ this.blocks.length - 1 ]
    var mutations = [ ] 

    if (nodeToHoist.declarations) {

      for (var i = 0; i < nodeToHoist.declarations.length; i++){
        var declarator = nodeToHoist.declarations[i]

        var declaratorToHoist = new VariableDeclarator
        hoistingScope.queueHoistDeclarator(declaratorToHoist) 

        if (declarator.init) {
          var left = declarator.id
          var right = declarator.init
          var declarationMutation = new AssignmentExpression('=', left, right) 
          mutations.push(declarationMutation)
        }

      }

    } else {

      var declaratorToHoist = new VariableDeclarator(nodeToHoist.id, null)
      hoistingScope.queueHoistDeclarator(declaratorToHoist)

      var functionId = nodeToHoist.id
      var functionParams = nodeToHoist.params
      var functionBody = nodeToHoist.body
      var functionExpression = new FunctionExpression(functionId, functionParams, functionBody)

      if (nodeToHoist.instrumentScopeLink) {
        functionExpression.setNativeSource = function () {
          var id = this.id.toNativeSource()
          var params = ''
          if (this.params.length) {
            for (var i = 0; i < this.params.length; i++) {
              params += this.params[i].toNativeSource() + ','
            }

          } 

          var body = this.body.toNativeSource()
          this.nativeSource = 'Scope.link(function ' + id + ' (' + params + ') ' + body + ')'
        }
      }

      var functionMutation = new AssignmentExpression('=', functionId, functionExpression) 

      mutatingBlock.queueFunctionHoist(functionMutation)

    } 

    // track node for purposes of replacing/removing
    mutatingBlock.queueMutation(nodeToHoist, mutations)

  }
  
  applyHoisting () {
    var hoistingScope = this.scopes[ this.scopes.length - 1 ]
    return hoistingScope.instrumentHoisting()
  }

  applyMutation () {
    var mutatingBlock = this.blocks[ this.blocks.length - 1 ]
    return mutatingBlock.mutateDeclarations()
  } 

  applyBlockFunctionHoisting () {
    var hoistingBlock = this.blocks[ this.blocks.length - 1 ]
    return hoistingBlock.hoistFunctions()
  }

  applyScopeClosing () {
    var scopeToClose = this.scopes[ this.scopes.length - 1 ]
    return scopeToClose.instrumentScopeClosing()
  }

  registerReturn () {
    var scopeInProcessing = this.scopes[ this.scopes.length - 1 ] 
    scopeInProcessing.detectedReturn = true
  }

  closeScope () {
    var processedScope = this.scopes[ this.scopes.length - 1 ]
    return processedScope.appendScopeClosing()
  }

  logDeclaration (identifier) {
    var scope = this.scopes[ this.scopes.length - 1 ]
    scope.logDeclaration(identifier) 
  }

  detectClosure (identifier) {

    if (identifier.skipClosureDetection) {
      return delete identifier.skipClosureDetection
    }

    for (var i = this.scopes.length - 2; i >= 0; i--) {
      if (this.scopes[i].hasDeclaration(identifier)) {
        this.scopes[i].instrumentScopeCreateAndClose = true
        this.scopes[this.scopes.length - 1].instrumentScopeLink = true
        return
      }
    }
  }

  isIdentifierDeclared (identifier) {

    if (identifier.skipDeclarationDetection) {
      return delete identifier.skipDeclarationDetection
    }

    for (var i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasDeclaration(identifier)) {
        var undeclaredVarIndex = this.scopes[i].undeclaredVars.indexOf(identifier.name) 
        delete this.scopes[i].undeclaredVars.splice(undeclaredVarIndex, 1) 
        return true
      } 
    }

    if (identifier.name !== 'undefined') {
      this.scopes[ this.scopes.length - 1 ].undeclaredVars.push(identifier.name) 
    } 

  }

  throwUndeclaredReferenceErr () {
    const scope = this.scopes[ this.scopes.length - 1 ]
    const undeclaredVarLength = scope.undeclaredVars.length 
    if (undeclaredVarLength) {
      throw new ReferenceError(scope.undeclaredVars[ undeclaredVarLength ] + ' is not declared.') 
    } 
  } 

  shouldInstrumentScopeLink (node) {

    return this.scopes[ this.scopes.length - 1 ].instrumentScopeLink
      ? true 
      : false

  }

} 

class Block { 
  constructor () {
    this.mutationQueue = []
    this.functionHoistQueue = []
  }

  queueFunctionHoist (hoistedFunction) {
    this.functionHoistQueue.push(hoistedFunction) 
  }

  queueMutation (declaration, assignmentMutations) {
    this.mutationQueue.push([ declaration, assignmentMutations ])
  }

  hoistFunctions () {
    var functionHoistQueue = this.functionHoistQueue 
    return function () {

      if (functionHoistQueue.length === 1) {

        this.prependChild( new ExpressionStatement(functionHoistQueue[0]) )

      } else if (functionHoistQueue.length > 1) {

        var hoistedFunctions = 
          new ExpressionStatement(new SequenceExpression(functionHoistQueue))

        this.prependChild(hoistedFunctions) 

      } 
    }
  }

  mutateDeclarations () {
    var mutationQueue = this.mutationQueue
    return function () {
      var self = this

      for (var i = 0; i < mutationQueue.length; i++) {
        var mutation = mutationQueue[i]
        var declaration = mutation[0]
        var assignments = mutation[1]

        if (!assignments.length) {

          self.removeChild(declaration)

        } else if (assignments.length === 1) {

          var mutationPayload = new ExpressionStatement(assignments[0])
          self.replaceChild(declaration, mutationPayload)

        } else {

          var mutationPayload = new SequenceExpression(assignments)
          self.replaceChild(declaration, mutationPayload)

        }

      }
    }
  }
  

}

class Scope  {

  constructor (parent, contextDeclaredVariables) {
    this.parent = parent
    this.declaratorsToHoist = []
    this.loggedDeclarations = new Set()
    this.instrument = false  
    this.undeclaredVars = [] 

    if (contextDeclaredVariables) {
      for (var i = 0; i < contextDeclaredVariables.length; i++) {
        this.loggedDeclarations.add(contextDeclaredVariables[i]) 
      }
    }

  }

  instrumentHoisting () {

    if (this.declaratorsToHoist.length) {

      var hoistedDeclaration = new VariableDeclaration(this.declaratorsToHoist, 'var') 

      if (this.instrumentScopeCreateAndClose) {

        hoistedDeclaration.setNativeSource = function (type) {
          var declarations = ""
          for (var i = 0; i < this.declarations.length; i++){
            declarations += "'" + this.declarations[i].toNativeSource() + "'"  
            if (i !== this.declarations.length) {
              declarations += ", "
            }
          }
          this.nativeSource = 'Scope.create(this, [ ' + declarations + ' ], function () {'
            +   ' return eval(arguments[0])'
            + ' });'
        }

      } 

      return function () {
        this.prependChild(hoistedDeclaration) 
      }

    } else { 
      return new Function()
    }

  }

  logDeclaration (node) {
    this.loggedDeclarations.add(node.name)
  }

  hasDeclaration (identifier) {
    return this.loggedDeclarations.has(identifier.name)
  }

  queueHoistDeclarator (declarator) {
    this.declaratorsToHoist.push(declarator)
  }

  instrumentScopeClosing () { 

    if (this.instrumentScopeCreateAndClose) {

      return function () {

        const type = this.type
        const body = type === 'Program' 
          ? this.body 
          : this.body.body

        if (body[body.length - 1].type === 'ReturnStatement') {

          body[body.length - 1].setNativeSource = function () {
            var argument = this.argument
              ? this.argument.toNativeSource()
              : ''
            this.nativeSource = 'return Scope.close(' + argument + ');'
          }

        } else {

          if (type == 'Program') {

            this.setNativeSource = function () {
              var body = ''
              for (var i = 0; i < this.body.length; i++) {
                body += this.body[i].toNativeSource()
                if (i !== this.body.length) {
                  body += " "
                }
              } 
              this.nativeSource = body
            }

          } else if (this.type === 'FunctionDeclaration') {

            this.setNativeSource = function () {
              var functionBody = '' 
              for (var i = 0; i < this.body.length; i++) {
                functionBody += this.body[i].toNativeSource()
                if (i !== this.body.length) {
                  functionBody += ' '
                }
              } 
              var body = this.body.length
                ? '{ ' + functionBody + ' Scope.close(); }' 
                : '{ }'

              this.nativeSource = body
            }

          }

        }

      }

    } else { 

      return new Function ()

    }

  }

}

export const instrumentationVisitor = {
  BlockStatement: {
    enter: function (manifest) {
      manifest.pushNewBlock()
    },
    exit: function (manifest) {
      manifest.applyMutation().call(this)
      manifest.applyBlockFunctionHoisting().call(this)
      manifest.popBlock()
    }
  },
  CatchClause: {
    enter: function (manifest) {
      this.params[0].skipDeclarationDetection = true
      this.params[0].skipClosureDetection = true
      manifest.pushNewScope()
    },
    exit: function (manifest) {
      manifest.applyHoisting().call(this)
      manifest.popScope()
    } 
  },
  FunctionDeclaration: {
    enter: function (manifest) {
      for (var i = 0; i < this.params.length; i++) {
        this.params[i].skipDeclarationDetection = true
        this.params[i].skipClosureDetection = true
      }
      this.id.skipDeclarationDetection = true
      this.id.skipClosureDetection = true

      // id identifier must be logged at entrance so it is understood
      // to be declared when the actual identifier is visited
      manifest.logDeclaration(this.id)
      manifest.pushNewScope()

    }, 
    exit: function (manifest) {
      manifest.throwUndeclaredReferenceErr() 
      this.instrumentScopeLink = manifest.shouldInstrumentScopeLink()
      manifest.applyHoisting().call(this)
      manifest.applyScopeClosing().call(this)
      manifest.popScope()
      manifest.prepareHoisting(this)
    }
  },
  FunctionExpression: {
    enter: function (manifest) {
      for (var i = 0; i < this.params.length; i++) {
        this.params[i].skipDeclarationDetection = true
        this.params[i].skipClosureDetection = true
      }
      manifest.pushNewScope() 
    }, 
    exit: function (manifest) {
      manifest.throwUndeclaredReferenceErr() 
      manifest.applyHoisting().call(this)
      manifest.popScope()
    }
  },
  Identifier: {
    enter: function (manifest) {
      manifest.isIdentifierDeclared(this)
      manifest.detectClosure(this)
    }
  },
  MemberExpression: {
    enter: function (manifest) {
      this.property.skipDeclarationDetection = true
      this.property.skipClosureDetection = true
    }
  },
  ReturnStatement: {
    enter: function (manifest) {
      manifest.registerReturn() 
    },
  },
  Program: {
    enter: function (manifest) {
      manifest.pushNewScope() 
      manifest.pushNewBlock()
    },
    exit: function (manifest) {
      manifest.throwUndeclaredReferenceErr() 
      manifest.applyBlockFunctionHoisting().call(this)
      manifest.applyHoisting().call(this)
      manifest.applyMutation().call(this)
      manifest.applyScopeClosing().call(this)
      manifest.popScope()
      manifest.popBlock()
    }
  },
  VariableDeclaration: {
    enter: function (manifest) {
      manifest.prepareHoisting(this)
    }, 
  }, 
  VariableDeclarator: {
    enter: function (manifest) {
      // id identifier must be logged at entrance so it is understood
      // to be declared when the actual identifier is visited
      manifest.logDeclaration(this.id)
    }
  },
} 
