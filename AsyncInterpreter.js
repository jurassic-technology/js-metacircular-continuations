export default function getAsyncInterpreter (get, set, scope, unscope, parse) {

  class AsyncInterp extends AsyncScope {

    constructor (code) {

      this.get = get
      this.set = set
      this.scope = scope
      this.unscope = unscope
      this.parse = parse 

      if (typeof code === 'string') this.ast = parse(code)
      else this.ast = code 

      if (this.ast.id) set(this.ast.id.name, this) 
        
      this.this = undefined

    } 

    spawn (ast) {

      const interp = new AsyncInterp(ast, this)
      // TODO: how to handle this keyword here?
      interp.this = this.this
      interp.boundedArgs = this.boundedArgs 
      return interp  

    } 

    execute (args, prevCont, prevErrCont) {

      this.scope() 

      const argsObject = new Object
      const iterateArgs = this.boundedArgs.concat(args) 

      for (var i = 0; i < iterateArgs.length; i++) {
        if (this.ast.params[i]) this.set(this.ast.params[i].name, iterateArgs[i])
        argumentsObject[i] = iterateArgs[i]
      } 

      Object.defineProperty(argsObject, 'length', { value: iterateArgs.length, configurable: false }) 
      Object.defineProperty(argsObject, 'callee', { value: this.callee, configurable: false }) 
      this.set('arguments', argumentsObj) 

      const execution = new AsyncInterpreter(this.ast) 
      execution.boundedArgs = this.boundedArgs
      execution.this = this.this 
      return execution.i(execution.ast.body, nextContUnscope.bind(execution), nextErrContUnscope.bind(execution)) 

      function nextContUnscope () {
        this.unscope()
        return prevCont.apply(this, arguments) 
      }

      function nextErrContUnscope () {
        this.unscope()
        return prevErrCont.apply(this, arguments) 
      }

    }

    set boundedArgs (x) { return this._boundedArgs = x }
    get boundedArgs () { return this._boundedArgs }

    get this () { return this._this }
    set this (x) { return this._this = x }

    set callee (x) { this._callee = x } 
    get callee () { return this._callee } 

    call () {

      const prevThis = this.this
      this.this = arguments[0]
      const result = this.interpret.apply(this, Array.prototype.slice.call(arguments, 1))  
      this.this = prevThis
      return result

    }

    apply () {

      const prevThis = this.this
      this.this = arguments[0] 
      const result = this.interpret.apply(this, arguments[1]) 
      this.this = prevThis 
      return result 

    }
   
    bind () { 

      const interp = new AsyncInterp(this.ast) 
      interp.this = arguments[0]
      interp.boundedArgs = Array.prototype.slice.call(arguments, 1) 
      interp.callee = this
      return interp 

    }
    
    iNodeArray (nodes, prevCont, prevErrCont) {
      const results = new Array
      let i = 0
      (function iNextNode () {
        if (i <= nodes.length - 1) {
          const node = nodes[i++] 

          if (node === null) results.push(null) 
          if (node === null || node.type === 'EmptyStatement') return iNextNode()

          return this.i(node, nextCont, nextErrCont) 

          function nextCont (result) {
            results.push(result)
            return iNextNode()
          } 

          function nextErrCont (errType, value) {
            return prevErrCont(errType, value, results[ results.length - 1 ])
          } 

        } else {
          return prevCont(results)
        }
        
      })()
    } 

    i /*nterpret*/ (node, prevCont, prevErrCont) {

      if (!node) {
        prevCont() 
      } else if (node instanceof Object && typeof node.type !== 'undefined') { 
        switch (node.type) {
          case 'EmptyStatement':
            return continuation()
          case 'File':
            return this.program(node.program, continuation, errorContinuation)
          case 'Program':
            return this.program(node, continuation, errorContinuation)
          case 'BlockStatement':
            return this.blockStatement(node, continuation, errorContinuation)
          case 'FunctionDeclaration':
          case 'FunctionExpression':
            return this.functionExpression(node, continuation, errorContinuation)
          case 'VariableDeclaration':
            return this.variableDeclaration(node, continuation, errorContinuation)
          case 'VariableDeclarator':
            return this.variableDeclarator(node, continuation, errorContinuation)
          case 'ExpressionStatement':
            return this.evaluateNode(node.expression, continuation, errorContinuation)
          case 'SequenceExpression':
            return this.sequenceExpression(node, continuation, errorContinuation)
          case 'CallExpression':
            return this.callExpression(node, continuation, errorContinuation)
          case 'NewExpression':
            return this.newExpression(node, continuation, errorContinuation)
          case 'IfStatement':
          case 'ConditionalExpression':
            return this.conditionalExpression(node, continuation, errorContinuation)
          case 'WhileStatement':
          case 'DoWhileStatement':
          case 'ForStatement':
            return this.loopExpression(node, prevCont, prevErrCont)
          case 'ForInStatement':
          case 'ForOfStatement':
            return this.forInStatement(node, prevCont, prevErrCont)
          case 'BreakStatement':
          case 'ContinueStatement':
            return errorContinuation(node.type, (node.label ? node.label.name : undefined))
          case 'ReturnStatement':
          case 'ThrowStatement':
            return this.returnStatement(node, prevCont, prevErrCont)
          case 'TryStatement':
            return this.tryStatement(node, prevCont, prevErrCont)
          case 'CatchClause':
            return this.catchClause(node, prevCont, prevErrCont)
          case 'LogicalExpression':
            return this.logicalExpression(node, prevCont, prevErrCont)
          case 'BinaryExpression':
            return this.binaryExpression(node, prevCont, prevErrCont)
          case 'AssignmentExpression':
            return this.assignmentExpression(node, prevCont, prevErrCont)
          case 'UpdateExpression':
            return this.updateExpression(node, prevCont, prevErrCont)
          case 'UnaryExpression':
            return this.unaryExpression(node, prevCont, prevErrCont)
          case 'Identifier':
            return this.identifier(node, prevCont, prevErrCont)
          case 'MemberExpression':
            return this.memberExpression(node, prevCont, prevErrCont)
          case 'ThisExpression':
            return this.thisExpression(node, prevCont, prevErrCont)
          case 'Literal':
          case 'NumericLiteral':
            return this.literal(node, prevCont, prevErrCont)
          case 'ObjectExpression':
            return this.objectExpression(node, prevCont, prevErrCont)
          case 'ArrayExpression':
            return this.iNodeArray(node.elements, prevCont, prevErrCont)
          default:
            throw new Error('Node type ' + node.type + ' not supported')
        }
      } else {
        throw new Error('Node type ' + node.type + ' not supported')
      }
    }
  } 

  AsyncInterp.prototype.arrayExpression = require('./arrayExpression')
  AsyncInterp.prototype.assignmentExpression = require('./assignmentExpression')
  AsyncInterp.prototype.binaryExpression = require('./binaryExpression')
  AsyncInterp.prototype.blockStatement = require('./blockStatement')
  AsyncInterp.prototype.booleanLiteral = require('./booleanLiteral')
  AsyncInterp.prototype.callExpression = require('./callExpression')
  AsyncInterp.prototype.catchClause = require('./catchClause')
  AsyncInterp.prototype.conditionalExpression = require('./conditionalExpression')
  AsyncInterp.prototype.continueStatement = require('./continueStatement')
  AsyncInterp.prototype.doWhileStatement = require('./doWhileStatement')
  AsyncInterp.prototype.expressionStatement = require('./expressionStatement')
  AsyncInterp.prototype.forInStatement = require('./forInStatement')
  AsyncInterp.prototype.forOfStatement = require('./forOfStatement')
  AsyncInterp.prototype.forStatement = require('./forStatement')
  AsyncInterp.prototype.functionDeclaration = require('./functionDeclaration')
  AsyncInterp.prototype.functionExpression = require('./functionExpression')
  AsyncInterp.prototype.identifier = require('./identifier')
  AsyncInterp.prototype.ifStatement = require('./ifStatement')
  AsyncInterp.prototype.labeledStatement = require('./labeledStatement')
  AsyncInterp.prototype.logicalExpression = require('./logicalExpression')
  AsyncInterp.prototype.memberExpression = require('./memberExpression')
  AsyncInterp.prototype.newExpression = require('./newExpression')
  AsyncInterp.prototype.nullLiteral = require('./nullLiteral')
  AsyncInterp.prototype.numericLiteral = require('./numericLiteral')
  AsyncInterp.prototype.objectExpression = require('./objectExpression')
  AsyncInterp.prototype.objectMethod = require('./objectMethod')
  AsyncInterp.prototype.program = require('./program')
  AsyncInterp.prototype.regExpLiteral = require('./regExpLiteral')
  AsyncInterp.prototype.returnStatement = require('./returnStatement')
  AsyncInterp.prototype.sequenceExpression = require('./sequenceExpression')
  AsyncInterp.prototype.stringLiteral = require('./stringLiteral')
  AsyncInterp.prototype.switchCase = require('./switchCase')
  AsyncInterp.prototype.switchStatement = require('./switchStatement')
  AsyncInterp.prototype.thisExpression = require('./thisExpression')
  AsyncInterp.prototype.throwStatement = require('./throwStatement')
  AsyncInterp.prototype.tryStatement = require('./tryStatement')
  AsyncInterp.prototype.unaryExpression = require('./unaryExpression')
  AsyncInterp.prototype.updateExpression = require('./updateExpression')
  AsyncInterp.prototype.variableDeclaration = require('./variableDeclaration')
  AsyncInterp.prototype.variableDeclarator = require('./variableDeclarator')
  AsyncInterp.prototype.whileStatement = require('./whileStatement')

  return AsyncInterp
  
}

