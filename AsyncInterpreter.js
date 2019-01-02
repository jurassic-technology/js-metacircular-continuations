module.exports = function getAsyncInterpreter (AsyncScope, parse) {

  class AsyncInterpreter extends AsyncScope {

    constructor (code, parent) {

      super(parent) 

      if (typeof code === 'string') this.ast = parse(code)
      else this.ast = code 

      if (this.ast.id) this.declare(this.ast.id.name, this) 
        
      this.this = undefined
      this.prototype = new Object 

    } 

    evaluate () {

      const self = this
      return new Promise(function (resolve, reject) {
        return self.interpret(self.ast, resolve, reject) 
      }) 

    }

    spawn (ast) {

      const newInterpreter = new AsyncInterpreter(ast, this)
      // TODO: how to handle this keyword here?
      newInterpreter.this = this.this
      newInterpreter.boundedArgs = this.boundedArgs 
      return newInterpreter

    } 

    execute () {

      const previousContinuation = arguments[arguments.length - 2]
      const previousErrorContinuation = arguments[arguments.length - 1]

      const argsObject = new Object
      const args = arguments[0]
      const iterateArgs = args 
        ? this.boundedArgs
          ? this.boundedArgs.concat(args)
          : args
        : args

      const execution = new AsyncInterpreter(this.ast, this.parent) 
      execution.boundedArgs = this.boundedArgs
      execution.this = this.this 

      if (this.ast.param) { // it's a catch block
        execution.declare(this.ast.param.name, args[0]) 
      } else {
        for (var i = 0; i < iterateArgs.length; i++) {
          if (this.ast.params[i]) {
            execution.declare(this.ast.params[i].name, iterateArgs[i])
          }
          argsObject[i] = iterateArgs[i]
        } 

        Object.defineProperty(argsObject, 'length', { value: iterateArgs.length, enumerable: false }) 
        Object.defineProperty(argsObject, 'callee', { value: this.callee, enumerable: false }) 
        execution.declare('arguments', argsObject) 

      } 

      return execution.interpret(execution.ast.body, previousContinuation, previousErrorContinuation)

    }

    get boundedArgs () { return this._boundedArgs }
    set boundedArgs (x) { return this._boundedArgs = x }

    get this () { return this._this }
    set this (x) { return this._this = x }

    get callee () { return this._callee } 
    set callee (x) { return this._callee = x } 

    get prototype (){ return this._prototype } 
    set prototype (x) { return  this._prototype = x } 

    call () {


      const self = this 
      const argsArray = Array.prototype.slice.call(arguments, 1, arguments.length - 2) 
      const previousContinuation = arguments[arguments.length - 2] 
      const previousErrorContinuation = arguments[arguments.length - 1] 
      const thisObj = arguments[0]

      const prevThis = this.this
      this.this = thisObj
      return this.execute(argsArray, nextContinuationResetThis, previousErrorContinuation)

      function nextContinuationResetThis (result, isReturn) {
        self.this = prevThis
        return previousContinuation(result, isReturn) 
      }

    }

    apply (thisObj, args, previousContinuation, previousErrorContinuation) {

      const self = this

      const prevThis = this.this
      this.this = thisObj
      return this.execute(args, nextContinuationResetThis, previousErrorContinuation) 

      function nextContinuationResetThis (result, isReturn) {
        self.this = prevThis
        return previousContinuation(result, isReturn)
      }

    }
   
    bind () { 

      const interpreter = new AsyncInterpreter(this.ast) 
      interpreter.this = arguments[0]
      interpreter.boundedArgs = this.boundedArgs 
        ? this.boundedArgs.concat(Array.prototype.slice.call(arguments, 1))
        : Array.prototype.slice.call(arguments, 1)
      interpreter.callee = this
      return interpreter

    }
    
    interpretNodeArray (nodes, previousContinuation, previousErrorContinuation) {
      const self = this, results = new Array
      let i = 0;

      (function interpretNextNode () {

        if (i <= nodes.length - 1) {
          const node = nodes[i++] 

          if (node === null) results.push(null) 
          if (node === null || node.type === 'EmptyStatement') return interpretNextNode()

          return self.interpret(node, nextContinuation, nextErrorContinuation) 

          function nextContinuation (result) {
            results.push(result)
            return interpretNextNode()
          } 

          function nextErrorContinuation (errType, value) {
            return previousErrorContinuation(errType, value, results[ results.length - 1 ])
          } 

        } else {
          return previousContinuation(results)
        }
        
      })()
    } 

    interpret (node, previousContinuation, previousErrorContinuation) {

      if (!node) {
        previousContinuation() 
      } else if (node instanceof Object && typeof node.type !== 'undefined') { 
        switch (node.type) {
          case 'AssignmentExpression':
            return this.assignmentExpression(node, previousContinuation, previousErrorContinuation)
          case 'ArrayExpression':
            return this.arrayExpression(node, previousContinuation, previousErrorContinuation)
          case 'CatchClause':
            return this.catchClause(node, previousContinuation, previousErrorContinuation)
          case 'EmptyStatement':
            return previousContinuation()
          case 'BinaryExpression':
            return this.binaryExpression(node, previousContinuation, previousErrorContinuation)
          case 'BlockStatement':
            return this.blockStatement(node, previousContinuation, previousErrorContinuation)
          case 'BreakStatement':
            return this.breakStatement(node, previousContinuation, previousErrorContinuation)
          case 'CallExpression':
            return this.callExpression(node, previousContinuation, previousErrorContinuation)
          case 'ConditionalExpression':
            return this.conditionalExpression(node, previousContinuation, previousErrorContinuation)
          case 'ContinueStatement':
            return this.continueStatement(node, previousContinuation, previousErrorContinuation) 
          case 'DoWhileStatement':
            return this.doWhileStatement(node, previousContinuation, previousErrorContinuation) 
          case 'ExpressionStatement':
            return this.expressionStatement(node, previousContinuation, previousErrorContinuation)
          case 'File':
            return this.program(node.program, previousContinuation, previousErrorContinuation)
          case 'ForStatement':
            return this.loopExpression(node, previousContinuation, previousErrorContinuation)
          case 'ForInStatement':
            return this.forInStatement(node, previousContinuation, previousErrorContinuation) 
          case 'ForOfStatement':
            return this.forOfStatement(node, previousContinuation, previousErrorContinuation)
          case 'FunctionDeclaration':
            return this.functionDeclaration(node, previousContinuation, previousErrorContinuation) 
          case 'FunctionExpression':
            return this.functionExpression(node, previousContinuation, previousErrorContinuation)
          case 'Identifier':
            return this.identifier(node, previousContinuation, previousErrorContinuation)
          case 'IfStatement':
            return this.ifStatement(node, previousContinuation, previousErrorContinuation) 
          case 'LogicalExpression':
            return this.logicalExpression(node, previousContinuation, previousErrorContinuation)
          case 'MemberExpression':
            return this.memberExpression(node, previousContinuation, previousErrorContinuation)
          case 'NewExpression':
            return this.newExpression(node, previousContinuation, previousErrorContinuation)
          case 'NullLiteral': 
            return this.nullLiteral(node, previousContinuation, previousErrorContinuation) 
          case 'NumericLiteral':
            return this.numericLiteral(node, previousContinuation, previousErrorContinuation)
          case 'ObjectExpression':
            return this.objectExpression(node, previousContinuation, previousErrorContinuation)
          case 'ObjectMethod':
            return this.objectMethod(node, previousContinuation, previousErrorContinuation) 
          case 'ObjectProperty':
            return this.objectProperty(node, previousContinuation, previousErrorContinuation) 
          case 'Program':
            return this.program(node, previousContinuous, previousErrorContinuation)
          case 'ReturnStatement':
            return this.returnStatement(node, previousContinuation, previousErrorContinuation)
          case 'SequenceExpression':
            return this.sequenceExpression(node, previousContinuation, previousErrorContinuation)
          case 'ThrowStatement':
            return this.throwStatement(node, previousContinuation, previousErrorContinuation)
          case 'TryStatement':
            return this.tryStatement(node, previousContinuation, previousErrorContinuation)
          case 'ThisExpression':
            return this.thisExpression(node, previousContinuation, previousErrorContinuation)
          case 'StringLiteral':
            return this.stringLiteral(node, previousContinuation, previousErrorContinuation)
          case 'UpdateExpression':
            return this.updateExpression(node, previousContinuation, previousErrorContinuation)
          case 'UnaryExpression':
            return this.unaryExpression(node, previousContinuation, previousErrorContinuation)
          case 'VariableDeclaration':
            return this.variableDeclaration(node, previousContinuation, previousErrorContinuation)
          case 'VariableDeclarator':
            return this.variableDeclarator(node, previousContinuation, previousErrorContinuation)
          case 'WhileStatement':
            return this.whileStatement(node, previousContinuation, previousErrorContinuation) 
          default:
            throw new Error('Node type ' + node.type + ' not supported')
        }
      } else {
        throw new Error('Node type ' + node.type + ' not supported')
      }
    }


    assignmentExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this
      let rightVal

      return this.interpret(node.right, nextContRight, previousErrorContinuation) 

      function nextContRight (right) {

        rightVal = right
        if (node.operator === '=') return self.setValue(node.left, right, previousContinuation, previousErrorContinuation) 
        else return self.interpret(node.left, nextContLeft, previousErrorContinuation) 

      }

      function nextContLeft (left) { 

        const value = this.computeAssignmentExpression(left, rightVal, node.operator)
        if (value instanceof Error) return previousErrorContinuation(new Error('Invalid operator: ' + node.operator))
        else return setValue(node.left, value, previousContinuation, previousErrorContinuation) 

      }   

    } 

    arrayExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this

      return this.interpretNodeArray(node.elements, nextCont, previousContinuation)

      function nextCont () { return previousContinuation.apply(self, arguments) }

    } 


    binaryExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this
      let leftVal

      return this.interpret(node.left, nextContLeft, previousErrorContinuation)

      function nextContLeft (left) {

        leftVal = left
        return self.interpret(node.right, nextContRight, previousErrorContinuation)

      }

      function nextContRight (right) {

        const value = self.computeBinaryExpression(leftVal, right, node.operator)

        if (value instanceof Error) {
          return previousErrorContinuation('Error', new Error('Invalid operator: ' + self.operator))
        } else {
          return previousContinuation(value)
        }

      }

    }

    blockStatement (node, previousContinuation, previousErrorContinuation) {

      return this.interpretNodeArray(node.body, nextContinuation, nextErrorContinuation)

      function nextContinuation (results) {

        return previousContinuation(results [ results.length - 1 ])

      }

      function nextErrorContinuation (errType, result) {

        switch (errType) {
          case 'ReturnStatement':
            return previousContinuation(result, true)
          case 'ContinueStatement':
          case 'BreakStatement':
          case 'ReferenceError':
          case 'ThrowStatement':
          case 'Error':
          default:
            return previousErrorContinuation(errType, result)

        }

      }

    }

    booleanLiteral (node, previousContinuation, previousErrorContinuation) {

      return previousContinuation(node.value)

    }


    breakStatement (node, previousContinuation, previousErrorContinuation) {

      const label = node.label ? node.label.name : undefined
      return previousErrorContinuation('BreakStatement', label) 

    }


    callExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this
      let args, property, obj 

      return this.interpretNodeArray(node.arguments, nextContinuationArgs, previousErrorContinuation) 

      function nextContinuationArgs (argArray) {

        args = argArray

        if (node.callee.type === 'MemberExpression') {

          return self.interpret(node.callee.object, nextContinuationMember, previousErrorContinuation) 

        } else {

          if (node.callee.name === 'eval') {

            return self.interpretEval(argArray, previousContinuation, previousErrorContinuation)

          } else {


            return self.interpret(node.callee, nextContinuationCallee, previousErrorContinuation)

          } 

        }   

      }   

      function nextContinuationMember (object) {

        obj = object 
        if (node.callee.computed) return self.interpret(node.callee.property, nextContinuationComputed, previousErrorContinuation)
        else return performCall(object, node.callee.property.name) 

      }   



      function nextContinuationComputed (prop) {
        return performCall(obj, prop) 
      }   


      function performCall (object, prop) {

        if (object === Object && args[0] instanceof AsyncInterpreter) {

          if (prop === 'setPrototypeOf') {

            args[0].prototype = args[1] 
            return previousContinuation(args[0]) 

          } else if (prop === 'getPrototypeOf') {

            const prototype = args[0].prototype
            return previousContinuation(prototype) 

          }

        } else if (object instanceof AsyncInterpreter) {

          if (prop === 'call') {
            
            args.push(previousContinuation, previousErrorContinuation) 
            return object.call.apply(object, args) 
            
          } else if (prop === 'apply') {

            args.push(previousContinuation, previousErrorContinuation) 
            return object.apply(args[0], args[1], previousContinuation, previousErrorContinuation) 
            
          } else if (prop === 'bind') {

            const boundFunction = object.bind.apply(object, args)
            return previousContinuation(boundFunction) 

          }


        } else {

          return nextContinuationCallee(object[node.callee.property.name], object) 

        } 


      }

      function nextContinuationCallee (callee) {
        
        if (callee instanceof AsyncInterpreter) {
          return callee.execute(args, previousContinuation, previousErrorContinuation) 
        } else {
          return previousErrorContinuation('TypeError', node.callee.name + ' is not a function.') 
        }   

      }   


      function executeApplyBindOrCall (kind) {
        argsArray.push(previousContinuation, previousErrorContinuation) 
        return object[kind].apply(object, args)
      }

    }


    catchClause (node, previousContinuation, previousErrorContinuation) {

      return this.interpret(node.body, previousContinuation, previousErrorContinuation) 

    }


    conditionalExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this

      return this.i(node.test, nextContTest, previousErrorContinuation)

      function nextContTest (test) {

        if (test) return self.interpret(node.consequent, previousContinuation, previousErrorContinuation)
        else return self.interpret(node.alternate, previousContinuation, previousErrorContinuation)

      }

    }



    doWhileStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this
      let lastResult

      return self.interpret(node.body, nextContinuationBody, previousErrorContinuation)

      function nextContinuationBody (result) {

        lastResult = result
        return self.interpret(node.test, nextContinuationTest, previousErrorContinuation)

      }

      function nextErrorContinuationBody (errType, value, extra) {

        switch (errType) {

          case 'BreakStatement':

            if (!value) return previousContinuation(extra ? extra : lastResult)
            else return previousErrorContinuation(errType, value)

          case 'ContinueStatement':

            return self.interpret(node.test, nextContinuationTest, previousErrorContinuation)

          default:

            return previousErrorContinuation.apply(null, arguments)

        }
      }

      function nextContinuationTest (test) {

        if (test) return self.interpret(node.body, nextContinuationBody, nextErrorContinuationBody)
        else return previousContinuation(lastResult)

      }

    }

    expressionStatement (node, previousContinuation, previousErrorContinuation) {

      return this.interpret(node.expression, previousContinuation, previousErrorContinuation) 

    }


    forInStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this, iterables = []
      let lastResult

      const left = node.left.type === 'VariableDeclaration'
        ? this.left.declarations[0].id
        : this.left

      self.scope.declare(left.name, undefined)

      return self.interpret(scope, nextContRight, previousErrorContinuation)

      function nextContRight (right) {

        iterables = Object.keys(right)
        if (iterables.length)  {

          const leftNode = getLeftSetter(iterables.shift())
          return self.interpret(leftNode, nextContInitBodyLoop, previousErrorContinuation)

        } else  {

          return previousContinuation()

        }

        function getLeftSetter (value) {
          const rightNode = new StringLiteral(value)
          return new AssignmentExpression('=', left, rightNode)
        }

        function nextContInitBodyLoop () {
          return self.interpret(node.body, nextContinuationLoopBody, nextErrorContinuationBody)
        }

        function nextContinuationLoopBody (result, doNotSetLastResult) {
          if (!doNotSetLastResult) lastResult = result
          if (iterables.length) {
            self.interpret(getLeftSetter(iterables.shift()), nextContinuationInitBodyLoop, previousErrorContinuation)
          }
          return previousContinuation(lastResult)
        }

        function nextErrorContinuationBody (errType, value, extra) {

          switch (errType) {
            case 'BreakStatement':
              if (typeof value === 'undefined') return previousContinuation()
              return previousErrorContinuation(errType, value)
            case 'ContinueStatement':
              if (typeof value === 'undefined') return nextContLoopBody(undefined, true)
              return previousErrorContinuation(errType, value)
            case 'ReturnStatement':
            default:
              return previousErrorContinuation(errType, value, extra)

          }
        }
      }
    }

    forOfStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this, iterables = []
      let lastResult

      const left = node.left.type === 'VariableDeclaration'
        ? this.left.declarations[0].id
        : this.left

      self.d(left.name, undefined)

      return self.interpret(node.right, nextContRight, previousErrorContinuation)

      function nextContRight (right) {

        for (const iterable of right) iterables.push(iterable)

        if (iterables.length)  {

          const leftNode = getLeftSetter(iterables.shift())
          return self.interpret(leftNode, nextContInitBodyLoop, previousErrorContinuation)

        } else  {
          return previousContinuation()
        }

      }

      function getLeftSetter (value) {
        const rightNode = new StringLiteral(value)
        return new AssignmentExpression('=', left, rightNode)
      }

      function nextContInitBodyLoop () {
        return self.interpret(node.body, nextContinuationLoopBody, nextErrorContinuationBody)
      }

      function nextContinuationLoopBody (result) {
        lastResult = result
        if (iterables.length) {
          self.interpret(getLeftSetter(iterables.shift()), nextContInitBodyLoop, previousErrorContinuation)
        }
        return previousContinuation(lastResult)
      }


      function nextErrorContinuationBody (errType, value, extra) {
        switch (errType) {
          case 'BreakStatement':
            if (typeof value === 'undefined') return previousContinuation()
            return previousErrorContinuation(errType, value)
          case 'ContinueStatement':
            if (typeof value === 'undefined') return nextContLoopBody(undefined, true)
            return previousErrorContinuation(errType, value)
          case 'ReturnStatement':
          default:
            return previousErrorContinuation.apply(null, arguments)
        }
      }

    }


    forStatement (node, previousContinuation, previousErrorContinuation) {
      const self = this
      let lastResult

      return this.interpret(node.init, nextContinuationInit, previousErrorContinuation)

      function nextContinuationInit () {
        return self.interpret(node.test, nextContinuationTest, previousErrorContinuation)
      }

      function nextContinuationTest (test) {
        if (test) return self.interpret(node.body, nextContinuationBody, nextErrorContinuationBody)
        else return previousContinuation(lastResult)
      }

      function nextContinuationBody (result) {
        lastResult = result
        return self.interpret(node.update, nextContinuationUpdate, previousErrorContinuation)
      }

      function nextContinuationUpdate () {
        return self.interpret(node.test, nextContinuationTest, previousErrorContinuation)
      }

      function nextErrorContinuationBody (errType, value, extra) {
        switch (errType) {

          case 'BreakStatement':

            if (!value) return previousContinuation(extra ? extra : lastResult)
            else return previousErrorContinuation(errType, value)

          case 'ContinueStatement':

            if (!value) return self.interpret(node.update, nextContinuationUpdate, previousErrorContinuation)
            else return previousErrorContinuation(errType, value, nextContContinue)

          default:

            return previousErrorContinuation.apply(null, arguments)
        }
      }

      function nextContContinue () {
        return self.interpret(node.update, nextContUpdate, previousErrorContinuation)
      }

    }


    functionDeclaration (node, previousContinuation, previousErrorContinuation) {

      const interp = this.spawn(node)

      this.declare(node.id.name, interp)

      return previousContinuation(undefined) 

    } 

    functionExpression (node, previousContinuation, previousErrorContinuation) {

      const interp = this.spawn(node)

      return previousContinuation(interp) 

    }


    identifier (node, previousContinuation, previousErrorContinuation) {

      if (node.name === 'undefined') return this.resolveValue(undefined, previousContinuation, previousErrorContinuation)

      if (node.name === 'eval') { } 

      if (this.has(node.name)) return this.resolveValue(this.get(node.name), previousContinuation, previousErrorContinuation)

      return previousErrorContinuation('ReferenceError', new ReferenceError(node.name + ' is not declared.'))

    }

    ifStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this

      return this.interpret(node.test, nextContTest, previousErrorContinuation)

      function nextContTest (test) {

        if (test) return self.interpret(node.consequent, previousContinuation, previousErrorContinuation)
        else if (node.alternate) return self.interpret(node.alternate, previousContinuation, previousErrorContinuation)
        else return previousContinuation()

      }
    }

    labeledStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this

      return this.interpret(node.body, previousContinuation, nextErrorContinuationLabel)

      function nextErrorContinuationLabel (errType, label, extra) {
        switch (errType) {
          case 'BreakStatement':
            if (label === node.label.name) return previousContinuation(extra)
            else return previousErrorContinuation.apply(null, arguments)
          case 'ContinueStatement':
            if (label === node.label.name) return extra()
            else return previousErrorContinuation.apply(null, arguments)
          default:
            return previousErrorContinuation.apply(null, arguments)
        }
      }
    }


   memberExpression (node, previousContinuation, previousErrorContinuation) {

     const self = this
     let property

     if (node.computed) return this.interpret(node.property, nextContinuationProperty, previousErrorContinuation) 
     else if (!node.computed) {
       property = node.property.name
       return this.interpret(node.object, nextContinuationObject, previousErrorContinuation) 
     }
       
     function nextContinuationProperty (prop) {
       property = prop
       return self.interpret(node.object, nextContinuationObject, previousErrorContinuation) 
     } 
 
     function nextContinuationObject (object) {

       if (object instanceof AsyncInterpreter) {

         if (property === 'prototype') return previousContinuation(object.prototype) 

         if (property === 'call' || property === 'apply' || property === 'bind') {
           return previousContinuation(object[property])
         } 

       } 

       return readDescriptor(object, property) 
         
       function readDescriptor (object, property) {

         const descriptor = Object.getOwnPropertyDescriptor(object, property) 

         if (descriptor) {

           if (descriptor.get) {

             const method = descriptor.get()
             return method.execute([], nextContinuationGetterMethod, previousErrorContinuation)

           } else {

             return self.resolveValue(descriptor.value, nextContinuationResolveValue, previousErrorContinuation)

           }

         } 

         let prototype 
         if (object instanceof AsyncInterpreter) prototype = object.prototype
         else prototype = Object.getPrototypeOf(object)
         if (prototype ===  null) return previousContinuation(undefined) 
         return readDescriptor(prototype, property) 

       } 

     }


     function nextContinuationGetterMethod (value) {

       return self.resolveValue(value, nextContinuationResolveValue, previousErrorContinuation) 

     } 

     function nextContinuationResolveValue (value) {

       return previousContinuation(value)

     }

    }

    newExpression (node, previousContinuation, previousErrorContinuation) {

      var self = this, args, retVal

      return this.interpretNodeArray(node.arguments, nextContinuationArgs, previousErrorContinuation)

      function nextContinuationArgs (_args) {

        args = _args
        return self.interpret(node.callee, nextContinuationCallee, previousErrorContinuation)

      }

      function nextContinuationCallee (Constructor) {

        if (Constructor instanceof AsyncInterpreter) {

          retVal = Object.create(Constructor.prototype || new Object())
          return Constructor.apply(retVal, args, nextContinuationInterpret, previousErrorContinuation)

        } else {

          var err = new TypeError(type + ' is not a function')
          return prevErrCont(err)

        }

      }

      function nextContinuationInterpret (value, isReturn) {

        if (isReturn) { if (!value instanceof Object) value = thisObj }
        else value = retVal

        return previousContinuation(value)

      }

    }

    nullLiteral (node, previousContinuation, previousErrorContinuation) {
      return previousContinuation(null) 
    }


    numericLiteral (node, previousContinuation, previousErrorContinuation) {
      return previousContinuation(Number(node.value))
    } 

    objectExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this

      return this.interpretNodeArray(node.properties, nextContProperties, previousErrorContinuation) 

      function nextContProperties (results) {

        const object = new Object
        const properties = new Object

        for (var i = 0; i < node.properties.length; i++) {
          const el = results[i] 
          const prop = node.properties[i]
          const key = Array.isArray(el) ? el[0] : prop.key.name

          if (prop.type === 'ObjectMethod') {

              el.this = object
              const descriptor = { configurable: true }
              descriptor[ prop.kind ] = function returnMethod () { return el }
              properties[ key ] = descriptor 

          } else {

            if (el[1] instanceof AsyncInterpreter) el[1].this = object
            const descriptor = { value: el[1], enumerable: true } 
            properties[ key ] = descriptor 

          }   
        
        }   

        Object.defineProperties(object, properties) 

        return previousContinuation(object) 

      }
    } 

    objectMethod(node, previousContinuation, previousErrorContinuation) {
      const method = this.spawn(node, this) 
      return previousContinuation(method) 
    }

    objectProperty (node, previousContinuation, previousErrorContinuation) {
      const self = this, rv = new Array

      if (this.computed) return this.interpret(node.key, nextContinuationKey, previousErrorContinuation) 
      else {
        rv.push(node.key.name)
        return self.interpret(node.value, nextContinuationValue, previousErrorContinuation)
      }

      function nextContinuationKey (key) {
        rv.push(key) 
        return self.interpret(node.value, nextContinuationValue, previousErrorContinuation) 
      }

      function nextContinuationValue (value) {
        rv.push(value)
        return previousContinuation(rv) 
      }

    } 

    program (node, previousContinuation, previousErrorContinuation) {

      return this.interpretNodeArray(node.body, nextContinuation, nextErrorContinuation) 

      function nextContinuation (results) {
        return previousContinuation(results[ results.length - 1 ]) 
      }

      function nextErrorContinuation (errorType, result){ 
        switch (errorType) {
          case 'ReturnStatement':
            return previousContinuation(result) 
          case 'ContinueStatement':
          case 'BreakStatement':
          case 'ReferenceError':
          case 'ThrowStatement':
          case 'Error':
            return previousErrorContinuation(result) 
        }
      }
    }

    regExpLiteral (node, previousContinuation, previousErrorContinuation) {
      const regex = new RegExp(node.pattern, node.flags) 
      return previousContinuation(regex) 
    } 

    returnStatement (node, previousContinuation, previousErrorContinuation) {

      if (node.argument) return this.interpret(node.argument, nextContinuation, previousErrorContinuation) 
      else return previousErrorContinuation(node.type) 

      function nextContinuation (argument) {
        return previousErrorContinuation(node.type, argument) 
      }
    } 


    sequenceExpression (node, previousContinuation, previousErrorContinuation) {

      return this.interpretNodeArray(node.expressions, nextContinuation, previousErrorContinuation) 

      function nextContinuation (results) { 
        return previousContinuationI(results[ results.length - 1 ]) 
      }

    }


    stringLiteral (node, previousContinuation, previousErrorContinuation) {
      return previousContinuation(node.value) 
    }


    switchStatement (node, previousContinuation, previousErrorContinuation) {
  
      let cases, discriminator, the_default

      return this.interpret(node.discriminant, nextContDiscriminant, previousErrorContinuation)

      function nextContDiscriminant (discriminant) {
        discriminator = discriminant
        return nextContCases(node.cases, nextContMatch, previousErrorContinuation)

        for (var i = 0; i < node.cases.length; i++) {

          const test = node.cases[i].test.type === 'Identifier'
            ? node.cases[i].test.name === discriminant
            : node.cases[i].test.value === discriminant

          if (node.cases[i].test.type === 'Identifier')
          if (test) cases = node.cases.slice(i)
          break

          if (discriminant) {
            cases = node.cases.slice(i)
          }

        }

      }

      function nextContCases (tests) {

        for (var i = 0; i < tests.length; i++){
          if (tests[i] === null) the_default = node.cases[i]
          if (tests[i] === discriminator) {
            cases = node.cases.slice(i)
            break
          }
        }

        if (!cases.length) cases = [ the_default ]

        return this.interpretNodeArray(cases, previousContinuation, previousErrorContinuation)

      }


    }



    stringLiteral (node, previousContinuation, previousErrorContinuation) {

      return previousContinuation(node.value) 

    }

    switchCase (node, previousContinuation, previousErrorContinuation) {

      return this.interpret(node.consequent, previousContinuation, previousErrorContinuation) 

    } 

    thisExpression (node, previousContinuation, previousErrorContinuation) {

      return previousContinuation(this.this)

    }


    throwStatement (node, previousContinuation, previousErrorContinuation) {

      return this.interpret(node.argument, nextContinuationArgument, previousErrorContinuation) 

      function nextContinuationArgument (argument) {
        return previousErrorContinuation(node.type, argument) 
      }
    } 


    tryStatement (node, previousContinuation, previousErrorContinuation) {

      const self = this
      const tryBlock = node.block 
      const handler = node.handler
      const finalizer = node.finalizer
      let evaluationValue, hadPreviousParamValue, previousParamValue
      

      return this.interpret(tryBlock, nextContinuationTry, nextContinuationInvokeCatchOrFinally)

      function nextContinuationTry (tryVal) {

        evaluationValue = tryVal

        if (finalizer) return self.interpret(finalizer, nextContinuationFinally, previousErrorContinuation)
        else return previousContinuation(tryValue)

      }

      function nextContinuationInvokeCatchOrFinally (errorType, error) {

        if (handler) {
          
          if (!self.has(handler.param.name)) self.declare(handler.param.name, error) 
          else {
            hadPreviousParamValue = true
            previousParamValue = self.get(handler.param.name) 
            self.set(handler.param.name, error) 
          }

          return self.interpret(handler, nextContinuationCatch, previousErrorContinuation)

        } else if (node.finalizer) {

          return self.interpret(finalizer, nextContinuationFinally, previousErrorContinuation)

        }

      }

      function nextContinuationCatch (value, isReturn) {

        if (hadPreviousParamValue) self.set(handler.param.name, previousParamValue) 
        else self.delete(handler.param.name) 

        if (isReturn) return previousErrorContinuation('ReturnStatement', value)

        if (node.finalizer) {
          evaluationValue = value 
          return self.interpret(finalizer, nextContinuationFinally, previousErrorContinuation)
        }

        return previousContinuation(value)

      }

      function nextContinuationFinally () {

        return previousContinuation(evaluationValue)

      }


    } 


    updateExpression (node, previousContinuation, previousErrorContinuation) {

      const self = this
      let arg

      return this.interpret(node.argument, nextContinuationArgument, previousErrorContinuation) 

      function nextContinuationArgument (argument) {
        arg = argument
        var value = argument

        if (node.operator === '++') value++
        else if (node.operator == '--') value--
        else return previousErrorContinuation('Error', new TypeError('Unimplemented update operator: ' + node.operator))

        return self.setValue(node.argument, value, nextContinuationValue, previousErrorContinuation)

      }   

      function nextContinuationValue (value) {
        var retVal = node.prefix ? value : arg 
        return previousContinuation(retVal)
      }   

    }


    unaryExpression (node, previousContinuation, previousErrorContinuation) {

      let obj

      if (node.argument instanceof MemberExpression) {

        return this.interpret(node.argument, nextContMemberObject, previousErrorContinuation)

      } else {

        if (node.operator === 'typeof' &&
            node.argunment.type === 'Identifier' &&
            !this.has(node.argument.name)){

          return previousContinuation(undefined)

        } else {

          return this.interpret(node.argument, nextContArgument, previousErrorContinuation)

        }

      }

      function nextContMemberObject (object) {

        obj = object
        if (self.argument.computed) return self.argument.property.interpret(scope, nextContComputedProperty, previousErrorContinuation)
        else return nextContArgument(null, object, self.argument.property.name)

      }

      function nextContComputedProperty (property) {
        return nextContArgument(null, obj, property)
      }


      function nextContArgument (value, object, property) {

        if (object && self.operator == 'delete') return previousContinuation(delete object[property])

        else if (object) value = object[propertyName]

        if (self.operator === 'typeof') {

          if (value instanceof AsyncScope) return previousContinuation('function')
          else return previousContinuation(typeof value)

        } 
        
        if (self.operator === 'void') return previousContinuation(undefined)
        else if (self.operator === '+') return previousContinuation(+value)
        else if (self.operator === '-') return previousContinuation(-value)
        else if (self.operator === '~') return previousContinuation(~value)
        else if (self.operator === '!') return previousContinuation(!value)

      }
        
    }

    variableDeclaration (node, previousContinuation, previousErrorContinuation) {

      return this.interpretNodeArray(node.declarations, nextContinuationDeclarators, previousErrorContinuation) 

      function nextContinuationDeclarators () {
        return previousContinuation(undefined)
      }

    } 

    variableDeclarator (node, previousContinuation, previousErrorContinuation) {
      
      const self = this

      if (node.init) return this.interpret(node.init, nextContinuation, previousErrorContinuation) 
      else return nextContinuation(undefined)

      function nextContinuation (value) {

        self.declare(node.id.name, value) 
        return previousContinuation(undefined)

      }

    } 

    computeAssignmentExpression (left, right, operator) {
      switch (node.operator) {
        case '+=':
          return left + right
        case '-=':
          return left - right
        case '*=':
          return left * right
        case '/=':
          return left / right
        case '%=':
          return left % right
        case '<<=':
          return left << right
        case '>>=':
          return left >> right
        case '>>>=':
          return left >>> right
        case '&=':
          return left & right
        case '|=':
          return left | right
        case '^=':
          return left ^ right
        default:
          return new Error()
      }
    }

    computeBinaryExpression (left, right, operator) {
      switch (operator) {
        case '+':
          return left + right
        case '-':
          return left - right
        case '===':
          return left === right
        case '==':
          return left == right
        case '!==':
          return left !== right
        case '!=':
          return left != right
        case '<':
          return left < right
        case '<=':
          return left <= right
        case '>':
          return left > right
        case '>=':
          return left >= right
        case '*':
          return left * right
        case '/':
          return left / right
        case 'instanceof':
          return left instanceof right
        case 'in':
          return left in right
        case '^':
          return left ^ right
        case '<<':
          return left << right
        case '>>':
          return left >> right
        case '>>>':
          return left >>> right
        case '%':
          return left % right
        case '&':
          return left & right
        case '|':
          return left | right
        default:
          return new Error()
      }
    }

    resolveValue (value, previousContinuation, previousErrorContinuation) {

      if (value instanceof Promise) return value.then(previousContinuation, previousErrorContinuation) 
      else return previousContinuation(value) 
      
    } 

    setValue (node, value, previousContinuation, previousErrorContinuation) {

      const self = this

      if (node.type === 'Identifier') {

        var success = this.set(node.name, value)
        if (!success) return previousErrorContinuation("ReferenceError", new ReferenceError())
        else return previousContinuation(value)

      } else if (node.type === 'MemberExpression') {

        var propertyName = node.computed ? node.property.value : node.property.name

        return this.interpret(node.object, nextContinuationObject, previousErrorContinuation)

        function nextContinuationObject (object) {

          const descriptor = Object.getOwnPropertyDescriptor(object, propertyName)

          if (descriptor && descriptor.set)  {

            const methodScope = descriptor.set
            const promise = new Promise(function (resolve, reject) { 
              return methodScope.interpret(value, resolve, reject) 
            })

            return this.resolveValue(promise)

          } else {

            object[propertyName] = value
            return self.resolveValue(value, previousContinuation, previousErrorContinuation)

          }
        }
      }
    }

  }

  return AsyncInterpreter
}

