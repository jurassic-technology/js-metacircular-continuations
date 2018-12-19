


class Scope {
  constructor (parent) {
    this.parent = parent
    this.environment = new Map()
  }

  newScope () {
    return new Scope(this)
  }

  declare (name, value) {
    this.environment.set(name, value) 
  }

  set (name, value) {
    if (this.has(name)) {
      this.environment.set(name, value) 
      return true 
    } else if (this.parent) {
      return this.parent.set(name, value) 
    } else {
      return false 
    }
  }

  has (name) {
    if (this.environment.has(name)) {
      return true 
    } else if (this.parent) {
      return this.parent.has(name)
    } else {
      return false 
    }
  }

  get (name) {
    if (this.environment.has(name)) {
      return this.environment.get(name)
    } else if (this.parent) {
      return this.parent.get(name)
    }
  }

}

function interpret(code) {
  var graph = parser.parse(code, { actions: actions })
  var scope = new Scope()
  return new Promise(function(resolve, reject) {
    return graph.interpret(scope, resolve, reject) 
  })
}

function evaluateWrapper(vm) {
  return new Promise(function (resolve, reject) {
    var ast = vm.compiler.ast
    return vm.interpreter.interpreterEvaluate(ast, resolve, reject)
  })
}

describe('Interpreter tests', function () {

  xdescribe('functions', function () {

    it('function should accept undefined as an argument and return it',  function (done) {

      interpret(
        ' function test(a) { return a }; test(undefined); '
      ).then(function(value) {
        
        expect(value).to.equal(undefined)
        done()

      }).catch(function (err) {

        done(err)

      })

    })

    it('Function returning "zult" should return "zult"', function (done) {

      interpret(
        'function crashTest () { return "zult" }; crashTest() '
      ).then(function (value) {
        expect(value).to.equal('zult')
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

    it('declared function can accept a property after being called', function (done) {

      interpret(
        ' function one() {};  one();  one.two = 3; one.two '
      ).then(function (value) {
        expect(value).to.equal(3)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    xdescribe('bind', function () { 


      it('a function should have a .bind method attached', function (done) {

        interpret(
          ' function stew () {}; stew.bind '
        ).then(function (value) {
          expect(value).to.equal(global.stew.bind)
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      it('.bind should bind `this` and return a new function', function (done) {

        interpret(
          '(function(b, c, d) {return this.a + b + c + d}).bind({a: 1})(2, 3, 4)'
        ).then(function (value) {
          expect(value).to.equal(10)
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })

      it('should execute .bind properly', function (done) {

        interpret(
          ' var javelin = { hippos: 33 }; function silk () { return this.hippos }; var worms = silk.bind(javelin); worms(); '
        ).then(function (value) {
          expect(value).to.equal(33)
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })
    
      it('should execute .bind repeatedly with arguments', function (done) {
    
        interpret(
          '(function(foo,bar,baz,bux){return arguments}).bind(null, 2).bind(null,3)(4,5)'
        ).then(function (value) {
          expect(value).to.deep.equal({ '0': 2, '1': 3, '2': 4, '3': 5 })  
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })
    
      it('should isolate repeated partial application of arguments with .bind', function (done) {
    
        interpret(
          'function binder(a,b,c,d){return a + b + c + d}; var half = binder.bind(null, 1,2); [half.bind(null,3,4)(),half(4,5)]'
        ).then(function (value) {
          expect(value).to.deep.equal([10,12])
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })

    })

    describe('apply', function () { 

      it('.apply should bind `this` and unroll arguments array', function (done) {

        interpret(
          '(function(b, c, d) {return this.a + b + c + d}).apply({a: 1}, [2,3,4])'
        ).then(function (value) {
          expect(value).to.equal(10)
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      it('should execute .apply properly concerning arguments', function (done) {

        interpret(
          ' var safari = function (a,b,c) { return a + b + c }; safari.apply(null,[1,2,3]) '
        ).then(function (value) {
          expect(value).to.equal(6)
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      xit('should execute .apply properly concerning the this keyword', function (done) {

        interpret(
          ' var hunt = function () { return this.swordfish }; var starfish = { swordfish: 99 }; hunt.apply(starfish) '
        ).then(function (value) {
          expect(value).to.equal(99)
          done()
        }).catch(function (err) {
          done(err)
        })

      })

    })

    describe('call', function () {

      it('.call should bind `this` and copy remaining arguments', function (done) {

        interpret(
          '(function(b, c, d) {return this.a + b + c + d}).call({a: 1}, 2, 3, 4)'
        ).then(function (value) {
          expect(value).to.equal(10)
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })

      xit('a function should have a .call method attached', function (done) {

        interpret(
          ' function stew () { }; stew.call '
        ).then(function (value) {
          expect(value).to.equal(global.stew.call)
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })
    
      it('should execute .call properly', function (done) {
    
        interpret(
          ' var crocodile = { swan: 55 }; function ghostbusters() { return this.swan }; ghostbusters.call(crocodile) '
        ).then(function (value) {
          expect(value).to.equal(55)
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })    

    })

  })

  describe('variable declarations', function (){

    it('should understand to assign undefined to a variable', function(done) { 

      interpret(
        ' var a = undefined; a; '
      ).then(function (value) {
        expect(value).to.equal(undefined)
        done()
      }).catch(function (err) { 
        done(err)
      })

    })

    it('Variable declaration with many declarators succeeds', function (done) { 
      interpret(
        ' var a, b; "" + a + b '
      ).then(function(value) {
        expect(value).to.equal('undefinedundefined')
        done()
      }).catch(function(err) { 
        done(err)
      })
    }) 

    it('Variable declaration succeeds', function (done) {

      interpret(
        ' var a; a '
      ).then(function (value) {
        expect(value).to.be.undefined
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

    it('Basic variable assignemnt works', function (done) { 
      interpret(
        ' var a = 5; a'
      ).then(function (value) {
        expect(value).to.equal(5) 
        done()
      }).catch(function (err) { 
        done(err)
      })
    })

    it('Variable assignemnt to an object works', function (done) {

      interpret(
        'var a = { a: 1, b: 2, c: 3 }; a '
      ).then(function (value) { 
        expect(value).to.deep.equal({ a: 1, b: 2, c: 3 })
        done()
      }).catch(function (err) { 
        done(err) 
      })

    })

    it('Variable assignment should evaluate undefined back into the console', function (done) {

      interpret(
        'var a = 5; '
      ).then(function (value) {
        expect(value).to.equal(undefined)
        done()
      }).catch( function (err) {
        done(err)
      })

    })
  
  })

  describe('lexical scoping', function () {

    it('Assignment happens in parent scope', function (done) {

      interpret(
        ' var a = 5; (function() { a = 10; return a})(); a '
      ).then(function (value) {
        expect(value).to.equal(10)
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('Var assignments happen in current scope', function (done) {

      interpret(
        ' var a = 5; (function() { var a = 10; return a})(); a '
      ).then(function (value) {
        expect(value).to.equal(5)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('Assignment happens in parent scope, no return statement', function (done) {

      interpret(
        ' var a = 5; (function() { a = 3 })(); a '
      ).then(function (value) {
        expect(value).to.equal(3)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('Var assignments happen in current scope, no return statement', function (done) {

      interpret(
        ' var a = 5; (function() { var a = 10})(); a '
      ).then(function (value) {
        expect(value).to.equal(5)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  describe('closures', function () { 

    it('Repeated closure calls create intermediate scopes', function (done) {

      interpret(
        ' function new_close() { var a = 1; return function() { a = a + 1;  return a } }; var q = new_close(); q(); [q(),(new_close())()] '
      ).then(function (value) {
        expect(value).to.deep.equal([3, 2])
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

  })


  describe('member expressions', function () {

    it('Accessing nth element of an array should return given value', function (done) {

      interpret(
        ' var arr = [0,1,2,3,4]; arr[3] '
      ).then(function (value) {
        expect(value).to.equal(3)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('Computed/bracket assignemnt of an object\'s property should assign successfully', function (done) {

      interpret(
        ' var boat = {}; boat["box"] = "box"; boat["box"]; '
      ).then(function (value) {
        done()
      }).catch(function (err) {
        done(err);
      })

    })

  })

  xdescribe('call expressions', function  () {

    it('Object fields should be accessible through `this`', function (done) {

      interpret(
        ' var obj = ( function outer () { return { b: 3, a: function() { return this.b } } } )(); obj.a() '
      ).then(function (value) {
        expect(value).to.equal(3)
        done()
      }).catch(function (err) {
        done(err)
      })

    })


  }) 


  describe('array expressions', function  () {
    
    it('should evaluate an empty array', function (done) {
      
      interpret(
        ' [] '
      ).then(function (value)  {
        expect(value).to.deep.equal([]) 
        done()
      }).catch(function(err) {
        done(err) 
      })

    }) 

    it('Array of null values should interpret to an array of null values', function (done) {

      interpret(
        ' [,,,] '
      ).then(function (value) {
        expect(value).to.deep.equal([null, null, null])
        done()
      }).catch(function (err) {
        done(err)
      })

    })


    it('Array with pre elisions should evaluate', function (done) {
      
      interpret(
        ' [ , , , 1 ] '
      ).then(function(value) {
         expect(value).to.deep.equal([ null, null, null, 1 ])
        done()
      }).catch(function(err) {
        done(err)
      })

    }) 

    it('Array with post elisions should evaluate', function (done) {
      
      interpret(
        ' [ 1 , , , ] '
      ).then(function(value) {
         expect(value).to.deep.equal([ 1, null, null, ])
        done()
      }).catch(function(err) {
        done(err)
      })

    }) 

    it('Array with pre, post and middle ellisions should evaluate', function (done) {

      interpret( 
        ' [ , , 1, , 1, , , 1, 1, 1, , , , ] '
      ).then(function (value) {

        expect(value).to.deep.equal([ null, null, 1, null, 1, null, null, 1, 1, 1, null, null, null ])
        done()

      }).catch(function (err) {

        done(err)

      }) 

    }) 

    

  })


  describe('array native methods', function () { 
    
    describe('native methods that do not accept functions as arguments', function () {
      it('should call .push on an array', function (done) {
        interpret(
          ' var arr = []; arr.push(1); arr '
        ).then(function (value) { 
          expect(value).to.deep.equal([1])
          done()
        }).catch(function (err) { 
          done(err)
        })
      })
  
      it('should call .indexOf on an array', function (done) {
        interpret(
          ' var arr = [ 1 ]; arr.indexOf(1); '
        ).then(function (value) {
          expect(value).to.deep.equal(0);
          done()
        }).catch(function (err) { 
          done(err)
        })
      })
  
      it('should call .slice on an array', function (done) {
        interpret( 
          ' var arr = [ 1, 2, 3, 4]; arr.slice(1,3); '
        ).then(function (value) {
          expect(value).to.deep.equal([2,3])
          done()
        }).catch(function (err) { 
          done(err)
        })
      })
  
      it('should call .unshift on an array', function (done) {
        interpret( 
          ' var arr = [ 1, 2, 3 ]; arr.unshift(); '
        ).then(function(value) { 
          expect(value).to.deep.equal(3);
          done()
        }).catch(function(err) { 
          done(err)
        })
      })
  
      it('should call .reverse on an array', function (done) {
        interpret(
          ' var arr = [ 1, 2, 3 ]; arr.reverse() '
        ).then(function(value) {
          expect(value).to.deep.equal([3,2,1])
          done()
        }).catch(function(err) { 
          done(err)
        })
      })

      it('should call .fill on an array', function (done) { 
        interpret(
          'var arr = [ 1, 1, 1 ]; arr.fill(9) '
        ).then(function (value) {
          expect(value).to.deep.equal([ 9, 9, 9 ])
          done()
        }).catch(function(err) {
          done(err) 
        })
      })

      it('should call .includes on an array', function (done) {
        interpret(
          ' var arr = [ 1, 2, 3, 4 ]; arr.includes(4) '
        ).then(function (value) { 
          expect(value).to.be.true
          done()
        }).catch(function (err) { 
          done(err) 
        })
      })

      it('should call .join on an array', function(done) {
        interpret(
          ' var arr = [ "j", "o", "i", "n" ]; arr.join("") '
        ).then(function (value) { 
          expect(value).to.equal('join')
          done()
        }).catch( function (err) { 
          done(err)
        })
      })
    })

    xdescribe('native methods that accept functions as arguments', function () { 

      xit('should call .filter on an array with a function for an argument', function (done) {

      })

      xit('should call .find on an array with a function for an argument', function (done) {

      })

      xit('should call .findIndex on an array with a function for an argument', function (done) {

      })

      xit('should call .map on an array with a function for an argument', function (done) {

      })

      xit('should call .forEach on an array with a function for an argument', function (done) {

      })

      xit('should call .reduce on an array with a function for an argument', function (done) {

      })

      xit('should call .some on an array with a function for an argument', function (done) {

      })

    })

  })


  describe.only('object expressions', function () {

    it('should be able to create an object', function (done) {

      interpret(
        ' var a = { b:1, c:2 }; a '
      ).then(function (value) {
        expect(value.b).to.equal(1)
        expect(value.c).to.equal(2)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it.only('should be able xo create an object with a getter', function (done) {
     
      interpret(
        ' var a = { get b () { var a = 5; var c = 5; return this.z }, set b (x) { var a = 5; this.z = x } }  '
      ).then( (val) => {
        done()
      }).catch( (err) => {
        done(err)
      })

    })

  })



  describe('update expressions', function () {

    it('increment operator should work', function (done) {

      interpret(
        ' var goose = 5; goose++; goose '
      ).then(function (value) {
        expect(value).to.equal(6)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('decrement operator should work', function (done) {

      interpret(
        ' var falcon = 101; falcon--; falcon '
      ).then(function (value) {
        expect(value).to.equal(100)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })


  describe('try statements, catch clauses, and finalizers', function () { 

    it('try catch block should execute the catch block', function (done) {

      interpret(
        ' try { a } catch (e) { 55 } '
      ).then(function (value) {
        expect(value).to.equal(55)
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })
  
    it('catch block should receive error parameter', function (done) {
  
      interpret(
        ' try { a } catch (e) { e } '
      ).then(function (value) {
        expect(value instanceof ReferenceError).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

    it('runs code after a catch block ', function (done) {
  
      interpret(
        ' try { a } catch (e) { e } 55 '
      ).then(function (value) {
        expect(value).to.equal(55)
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })
  
    it('finally block executes without catch block', function (done) { 
  
      interpret(
        ' try { a } finally { 500 } '
      ).then(function(value) { 
        expect(value).to.equal(500)
        done()
      }).catch(function(err) { 
        done(err)
      })
  
    })
  
    it('finally block excecutes with catch block', function (done) {
  
      interpret(
        ' try { a } catch (e) { e } finally { 500 } '
      ).then(function(value) { 
        expect(value).to.equal(500)
        done()
      }).catch(function(err) { 
        done(err)
      })
  
    })

    it('catch block changes outer scope variable ', function (done) {

      interpret(
        ' var z = 9; try { a } catch (e) { z = 18 }; z '
      ).then(function(value) {
        expect(value).to.equal(18)
        done()
      }).catch(function(err) { 
        done(err) 
      })

    })

    xit('creates an instance of a constructor inside try/catch', function(done) {
      interpret(
        ' function Bat () { this.a = function () { return 99 } }; try { asdf } catch (e) { var bat = new Bat(); bat.a() } '
      ).then(function(value) {
        expect(value).to.equal(99)
        done()
      }).catch(function (err) {     
        done(err)
      })
    })

    it('catch block returns a value from a function', function(done) { 

      interpret(
        ' function test() { try { a } catch(e) { return 5 } }; test() '
      ).then(function(value) { 
        expect(value).to.equal(5)
        done()
      }).catch(function(err) {
        done(err)
      })

    })


  })

  describe('logical expressions', function () {

    it('logical NOT (!) should flip false to true', function (done) {

      interpret(
        ' !false '
      ).then(function (value) {
        expect(value).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('logical AND (&&) evaluates as expected', function (done) {

      interpret(
        ' true && true '
      ).then(function (value) {
        expect(value).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('logical OR (||) evaluates as expected', function (done) {

      interpret(
        ' false || true '
      ).then(function (value) {
        expect(value).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('logical NOT on a string', function (done) {

      interpret(
        ' !"light" '
      ).then(function (value) {
        expect(value).to.be.false
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  describe('errors', function () { 

    it('should evaluate reference error inside if statement', function(done) { 
      
      interpret(
        ' if (true) { asdf } '
      ).then(function(value) {
        expect(value instanceof ReferenceError).to.be.true
        done()
      }).catch(function(err) { 
        done(err)
      })

    })

    it('should return an error from a nested if statement', function (done) {
      
      interpret(
        ' if (true) { if (true) { asdf } } '
      ).then(function(value) {
        expect(value instanceof ReferenceError).to.be.true
        done()
      }).catch(function(err) { 
        done(err)
      })

    })

  })

  describe('typeof', function () {

    it('should properly evaluate typeof a string', function (done) {

      interpret(
        ' typeof "string" '
      ).then(function (value) {
        expect(value).to.equal('string')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should properly evaluate typeof a number', function (done) {

      interpret(
        ' typeof 55 '
      ).then(function (value) {
        expect(value).to.equal('number')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should properly evaluate typeof a function ', function (done) {

      interpret(
        ' typeof function() { } '
      ).then(function (value) {
        expect(value).to.equal('function')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should properly evaluate typeof an object ', function (done) {

      interpret(
        ' typeof {} '
      ).then(function (value) {
        expect(value).to.equal('object')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should properly evaluate typeof something that is not defined ', function (done) {

      interpret(
        ' typeof x '
      ).then(function (value) {
        expect(value).to.equal('undefined')
        done()
      }).catch(function (err) {
        if (expect(err instanceof ReferenceError)) {
          done() 
        } else { 
          done(err)
        }
      })

    })

  })

  describe('sequence expression', function (done) {

    it('should properly evaluate the comma operator', function (done) {

      interpret(
        ' 1,2,3,4 '
      ).then(function (value) {
        expect(value).to.equal(4)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  it('should properly a string of expressions joined by the comma operator', function (done) {

    interpret(
      ' var spoon = 0; spoon += 1, spoon += 2 '
    ).then(function (value) {
      expect(value).to.equal(3)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('concatenates string with the addition operator', function (done) {

    interpret(
      ' "economic" + " " + "space" '
    ).then(function (value) {
      expect(value).to.equal('economic space')
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  describe('conditional expressions', function (done) {

    it('evaluates a falsy ternary', function (done) {

      interpret(
        ' false ? 5 : 6 '
      ).then(function (value) {
        expect(value).to.equal(6)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('evaluates a truthy ternary', function (done) {

      interpret(
        ' true ? 5 : 6 '
      ).then(function (value) {
        expect(value).to.equal(5)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })




  it('should return a reference error', function (done) {

    interpret(
      ' var b = 5; b + a '
    ).catch(function (err) {
      if (expect(err instanceof ReferenceError)) {
        done()
      } else {
        done(err)
      }
    })

  })

  it('should understand undefined', function (done) {

    interpret(
      ' undefined '
    ).then(function (value) {
      expect(value).to.be.undefined
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  xdescribe('hoisting', function () {

    it('should hoist variable declaration when decalred after return statement', function (done) {

      interpret(
        ' (function() { return a; var a = 5})() '
      ).then(function (value) {
        expect(value).to.be.undefined
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should hoist variable declaration and compute NaN', function (done) {

      interpret(
        ' ( function() { var a = b + 2; var b = "magus"; return a; } )() '
      ).then(function (value) {
        expect(Number.isNaN(value)).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  describe('delete operator', function () {

    it('delete operator should be able to delete an array element', function (done) {

      interpret(
        ' var cobra = [1,2,3]; delete cobra[1]; cobra; '
      ).then(function (value) {
        expect(value[1]).to.be.undefined
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('delete operator should be able to delete property on object declared with var', function (done) {

      interpret(
        ' var cobra = { rattle: true }; delete cobra.rattle; cobra; '
      ).then(function (value) {
        expect(value.rattle).to.be.undefined
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('delete operator should be able to property on object declared with var', function (done) {

      interpret(
        ' var cobra = { rattle: true }; delete cobra.rattle; cobra; '
      ).then(function (value) {
        expect(value.rattle).to.be.undefined
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    xit('delete operator cannot delete properties on native objects', function (done) {

      interpret(
        ' delete Math.PI; Math.PI '
      ).then(function (value) {
        expect(value).to.equal(Math.PI)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })


  describe('binary expressions', function () {

    it('bitwise AND should work', function (done) {

      interpret(
        ' 2 & 6 '
      ).then(function (value) {
        expect(value).to.equal(2)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise OR should work', function (done) {

      interpret(
        ' 2 | 8 '
      ).then(function (value) {
        expect(value).to.equal(10)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise XOR should work', function (done) {

      interpret(
        ' 2 ^ 8 '
      ).then(function (value) {
        expect(value).to.equal(10)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise left shift should work', function (done) {

      interpret(
        ' 9 << 2 '
      ).then(function (value) {
        expect(value).to.equal(36)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise right shift should work', function (done) {

      interpret(
        ' 9 >> 2 '
      ).then(function (value) {
        expect(value).to.equal(2)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise zero-fill right shift should work', function (done) {

      interpret(
        ' 9 >>> 2 '
      ).then(function (value) {
        expect(value).to.equal(2)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('subtraction operator should work', function (done) {

      interpret(
        ' 2 - 2 '
      ).then(function (value) {
        expect(value).to.equal(0)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('addition operator should work', function (done) {

      interpret(
        ' 2 + 2 '
      ).then(function (value) {
        expect(value).to.equal(4)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('multiplication operator should work', function (done) {

      interpret(
        ' 2 * 2 '
      ).then(function (value) {
        expect(value).to.equal(4)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('division operator should work', function (done) {

      interpret(
        ' 2 / 2 '
      ).then(function (value) {
        expect(value).to.equal(1)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('remainder operator should work', function (done) {

      interpret(
        ' 4 % 3 '
      ).then(function (value) {
        expect(value).to.equal(1)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  describe('unary expressions', function () {

    it('unary negation should work', function (done) {

      interpret(
        ' -55; '
      ).then(function (value) {
        expect(value).to.equal(-55)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise NOT should work', function (done) {

      interpret(
        ' ~100 '
      ).then(function (value) {
        expect(value).to.equal(-101)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  }) 

  describe('assignment expressions', function () {

    it('subtraction assignment should work', function (done) {

      interpret(
        ' var zebra = 2; zebra -= 2; zebra; '
      ).then(function (value) {
        expect(value).to.equal(0)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('addition assignment should work', function (done) {

      interpret(
        ' var elf = 2; elf += 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(4)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('multiplication assignment should work', function (done) {

      interpret(
        ' var elf = 2; elf *= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(4)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('division assignment should work', function (done) {


      interpret(
        ' var elf = 2; elf /= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(1)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('remainder assignment should work', function (done) {

      interpret(
        ' var elf = 4; elf %= 3; elf; '
      ).then(function (value) {
        expect(value).to.equal(1)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('binary left sbhift assignment should work', function (done) {

      interpret(
        ' var elf = 5; elf <<= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(20)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('binary right shift assignment should work', function (done) {

      interpret(
        ' var elf = 20; elf >>= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(5)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('binary unsigned right shift assignment should work', function (done) {

      interpret(
        ' var elf = -20; elf >>>= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(1073741819)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise AND (&=) assignment should work', function (done) {

      interpret(
        ' var elf = 30; elf &= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(2)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise XOR (^=) assignment should work', function (done) {

      interpret(
        ' var elf = 30; elf ^= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(28)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('bitwise OR (|=) assignment should work', function (done) {

      interpret(
        ' var elf = 25; elf |= 2; elf; '
      ).then(function (value) {
        expect(value).to.equal(27)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })


  it('All global variable accesses, should access the values on the global object provided', function (done) {

    interpret(
      ' var value = 1; value '
    ).then(function (value) {
      expect(value).to.equal(1)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('Should be able to return a from a variable value', function (done) {

    interpret(
      ' var value = 1; var a = value; a '
    ).then(function (value) {
      expect(value).to.equal(1)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to access properties on objects', function (done) {

    interpret(
      ' var value = { a: 1 }; value.a '
    ).then(function (value) {
      expect(value).to.equal(1)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to access properties on nested objects', function (done) {

    interpret(
      ' var value = { a: { b: 1 } }; value.a.b '
    ).then(function (value) {
      expect(value).to.equal(1)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to return the last value of an expression list', function (done) {

    // var value = {
    //    a: {
    //      b: 1
    //    }
    //  }
    //  value;
    //  value.a;
    //  value.a.b;
    //  value;

    interpret(
      ' var value = { a: { b: 1 } }; value; value.a; value.a.b; value '
    ).then(function (value) {
      expect(value).to.deep.equal({ a: { b: 1 } })
      done()
    }).catch(function (err) {
      done(err)
    })

  })


  it('should be able to return the last value of an expression list separated by coma', function (done) {

    // var value = {
    //   a: {
    //     b: 1
    //   }
    // };
    // value.a, value.a.b, value  '

    interpret(
      ' var value = { a: { b: 1 } }; value.a, value.a.b, value '
    ).then(function (value) {
      expect(value).to.deep.equal({ a: { b: 1 } })
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  xdescribe('native methods', function () { 

    it('should be able to call native member expressions', function (done) { 

      interpret(
        ' var a = { a: 1 }; Object.getOwnPropertyDescriptors(a); '
      ).then(function (value) {

        expect(value).to.deep.equal({
            "a": {
              "value": 1,
              "writable": true,
              "enumerable": true,
              "configurable": true
            }
        })

        done()

      }).catch(function (err) { 

        done(err)

      })

    })

    it('should freeze an object', function (done) {
      
      interpret(
        ' var a = { a: 1}; Object.freeze(a); Object.isFrozen(a) '
      ).then(function(value) {
        expect(value).to.be.true
        done()
      }).catch(function (err) { 
        done(err)
      })

    })

    it('should render an object not extendable', function (done) {

      interpret(
        ' var a = { a: 1 }; Object.preventExtensions(a); Object.isExtensible(a); '
      ).then(function (value) { 
        expect(value).to.be.false
        done()
      }).catch(function(err) { 
        done(err)
      })
      
    })

    it('should call a native method not attached to a member expression', function (done) {

      interpret(
        ' isNaN(NaN) '
      ).then(function(value) { 

        expect(value).to.be.true
        return interpret( ' isFinite(Infinity) ')

      }).then(function (value) {

        expect(value).to.be.false
        return interpret( "parseInt(' 0xF', 16) ")

      }).then(function(value) {

        expect(value).to.equal(15)
        done()
      
      }).catch(function(err) { 
        done(err)
      })


    })

  })

  it('should be able to increment a value', function (done) {

    interpret(
      ' var a = 1; a++; a '
    ).then(function (value) {
      expect(value).to.equal(2)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to decrement a value', function (done) {

    interpret(
      ' var a = 1; a--; a '
    ).then(function (value) {
      expect(value).to.equal(0)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  describe('loops', function () { 

    xdescribe('do while loop', function () {

      it('should be able to do a basic do while loop', function (done) {
        
        interpret(
          ' do { if (typeof i === "undefined") { var i = 0 }; i++ } while ( i <= 5 ) '
        ).then(function (value) {
          expect(value).to.equal(5)
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      it('should understand to break a do while loop', function(done) { 
        interpret(
          ' do { if (typeof i === "undefined") { i = 0 } if (i === 2) { break } i++ } while ( i <= 5 ) '
        ).then(function (value) {
          expect(value).to.equal(1)
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      it('should understand continue in a do while loop', function(done) { 
        
        interpret(
          ' var z = ""; do { if (typeof i === "undefined") { i = 0 } i++; if (i === 2) { continue } z += i } while ( i <= 2 ); z '
        ).then(function (value) {
          expect(value).to.equal('13')
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      it('should understand to break a nested do while loop', function (done) {
       
        interpret( 
          " i = 0; j = 0; z = ''; do { j = 0;  if ( typeof i == 'undefined' ) { i = 0 }; i++; z += ' i' + i; do { if ( typeof j == 'undefined' ) { j = 0}; j++; if (j == 2) { break } z += ' j' + j } while (j < 3) } while (i < 4); z "
        ).then(function(value) { 
          expect(value).to.equal(' i1 j1 i2 j1 i3 j1 i4 j1')
          done()
        }).catch(function (err) { 
          done(err)
        })

      })


      it('should understand continue in a nested do while loop', function (done) {

        interpret(
          " i = 0; j = 0; z = ''; do { j = 0;  if ( typeof i == 'undefined' ) { i = 0 }; i++; z += ' i' + i; do { if ( typeof j == 'undefined' ) { j = 0}; j++; if (j == 2) { continue } z += ' j' + j } while (j < 3) } while (i < 4) "
        ).then(function(value) {
          expect(value).to.equal(' i1 j1 j3 i2 j1 j3 i3 j1 j3 i4 j1 j3')
          done()
        }).catch(function (err) { 
          done(err)
        })

      })

    })



    xdescribe('while loops', function () { 

      it('should be able to do a while loop', function (done) {

        interpret(
          ' var a = 10; i = 0; while (i<a) { i++; i; } '
        ).then(function (value) {
          expect(value).to.equal(10);
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })


      it('should recognize continue in a while loop', function (done) {

        interpret(
          ' var a = 10; i = 0; z = ""; while (i < a) { i++; if ( i % 2 == 0 ) { continue }; z += i } z '
        ).then(function (value) {
          expect(value).to.equal('13579');
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })

      
      it('should recognize a break statement in a while loop', function (done) {

        interpret(
          ' var a = 10; i = 0; z = ""; while (i < a) { i++; if ( i == 3 ) { break }; z += i } z '
        ).then(function (value) {
          expect(value).to.equal('12');
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })


      it('should recognize a break statement for an inner while loop', function (done) {

        interpret(
          ' var a = 5; var j = 0; var i = 0; z = ""; while (i < a) { i++; while (j < a) { j++; if ( j == 3 ) { break }; z += " j" + j } z += " i" + i } z '
        ).then(function (value) {
          expect(value).to.equal(' j1 j2 i1 j4 j5 i2 i3 i4 i5');
          done()
        }).catch(function (err) {
          done(err)
        })
    
      })

      it('should recognize a continue statement on an inner while loop', function (done) { 

        interpret(
          ' var a = 5; var b = 3; var j = 0; var i = 0; z = ""; while (i < b) { i++; z += " i" + i; while (j < a) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
        ).then(function (value) {
          expect(value).to.equal(' i1 j1 j2 j4 j5 i2 i3');
          done()
        }).catch(function (err) {
          done(err)
        })

      })

      it('should recognize a continue statement on an outer while loop', function (done) { 

        interpret(
          ' var a = 5; var b = 3; var j = 0; var i = 0; z = ""; while (i < a) { i++; if ( i % 2 > 0 ){ continue }; z += " i" + i; while (j < b) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
        ).then(function (value) {
          expect(value).to.equal(' i2 j1 j2 i4');
          done()
        }).catch(function (err) {
          done(err)
        })

      })


      it('should recognize a break statement on an outer while loop', function (done) { 

        interpret(
          ' var a = 5; var b = 3; var j = 0; var i = 0; z = ""; while (i < a) { i++; if ( i === 2 ){ break }; z += " i" + i; while (j < b) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
        ).then(function (value) {
          expect(value).to.equal(' i1 j1 j2');
          done()
        }).catch(function (err) {
          done(err)
        })

      })

    })

    describe('for in loops', function () { 

      xit('should use a separate closure for the invocation of a constructor in each loop', function (done) { 

        interpret(
          ' var a = { a:1, b:2 }; function Class() { this.a = 5; this.b = function () { this.a++; return this.a } }; var z = ""; for (var key in a) { var thing = new Class(); z += thing.b(); z += thing.b() } z '
        ).then(function(value){
          expect(value).to.equal('6767')
          done()
        }).catch(function(err) {
          done(err)
        })

      })



      it('should be able to do a for in loop', function(done) {

        interpret(
          ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { z += key } '
        ).then(function(value) { 
          expect(value).to.equal('abc')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should recognize a break statement in a basic for in loop', function(done) {

        interpret(
          ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { if (key === "c") { break } z += key } z '
        ).then(function(value) { 
          expect(value).to.equal('ab')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should recognize a continue statement in a basic for in loop', function(done) {

        interpret(
          ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { if (key === "b") { continue } z += key } '
        ).then(function(value) { 
          expect(value).to.equal('ac')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should recognize a break statement inside a nested for in loop', function (done) {

        interpret(
          ' var z = ""; var obj = { a: 1, b: 2, c: 3 }; for (var key in obj) { for (var key2 in obj) { if (key2 === "b") { break } z += " inner" + key2 } z += " outer" + key } '
        ).then(function(value) {
          expect(value).to.equal(' innera outera innera outerb innera outerc')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should recognize a break statement inside a nested for in loop', function (done) {
        
        interpret(
          ' var z = ""; var obj = { a: 1, b: 2, c: 3 }; for (var key in obj) { for (var key2 in obj) { if (key2 == "b") { continue } z += " inner" + key2 } z += " outer" + key } '
        ).then(function (value) { 
          expect(value).to.equal(' innera innerc outera innera innerc outerb innera innerc outerc')
          done()
        }).catch(function (err) { 
          done(err)
        })

      })

    })

    describe('for of loops', function () { 

      it('should be able to do a for of loop', function (done ) {

        interpret(
          ' var a = [ 1, 2, 3]; var z = ""; for (var key of a) { z += key }; z '
        ).then(function(value){
          expect(value).to.equal('123')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should recognize a continue in a for of loop', function (done) {

        interpret(
          ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { if (key === 2) { continue } z += key }; z '
        ).then(function(value) {
          expect(value).to.equal('13')
          done()
        }).catch(function(err) {
          done(err)
        })

      })

      it('should recognize a break statement in a for of loop', function (done) {

        interpret(
          ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { if (key === 2) { break } z += key }; z '
        ).then(function(value) {
          expect(value).to.equal('1')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('should run a nested for of loop', function (done) {

        interpret(
          ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { z += key2 } }; z '
        ).then(function(value) {
          expect(value).to.equal('112321233123')
          done()
        }).catch(function (err) { 
          done(err)
        })

      })

      it('should recognize a break statement in a nested for of loop', function (done) { 
       
        interpret(
          ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { if (key2 === 2) { break }; z += key2 } }; z '
        ).then(function(value) {
          expect(value).to.equal('112131')
          done()
        }).catch(function(err) {
          done(err)
        })

      })

      it('should recognize a continue in a nested for of loop', function(done) {

        interpret(
          ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { if (key2 === 2) { continue }; z += key2 } }; z '
        ).then(function(value) {
          expect(value).to.equal('113213313')
          done()
        }).catch(function(err) {
          done(err)
        })

      })

    })

    describe('for loops', function () {

      it('should be able to do a for loop', function (done) {
        interpret(
          ' var a = 10; for ( var i = 0; i <= a; i++ ) { i }'
        ).then(function (value) {
          expect(value).to.equal(10);
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      xit('should use a separate closure for the invocation of a constructor in each loop', function (done) { 

        interpret(
          ' function Class() { this.a = 5; this.b = function () { this.a++; return this.a } }; var z = ""; for (var i = 0; i < 2; i++) { var thing = new Class(); z += thing.b(); z += thing.b() } z '
        ).then(function(value){
          expect(value).to.equal('6767')
          done()
        }).catch(function(err) {
          done(err)
        })

      })


      it('should be able to do a basic for loop with continue statement', function (done) { 
        interpret(
          ' var a = ""; for(var i = 0; i < 2; i++) { if (i == 1) { continue } a += i } '
        ).then(function(value) {
          expect(value).to.equal('0')
          done()
        }).catch( function(err) { 
          done(err) 
        })
      })

      it('should be able to do a basic for loop with break statement', function (done) {
        interpret(
          ' var a = ""; for (var i = 0; i < 1; i++) { a += i; if (i === 0) { break } }; a '
        ).then(function(value) {
          expect(value).to.equal('0')
          done()
        }).catch(function(err) { 
          done(err)
        })
      })

      it('break statement inside inner loop of a set of nested loops must only break the inner loop', function (done) { 

        interpret(
          'var a = ""; for (var i = 0; i < 4; i++) { a += " i" + i + " "; for (var j = 0; j < 4; j++) { if (j === 2) { break } a += "j" + j;  }  } '
        ).then(function(value) { 
          expect(value).to.equal(' i0 j0j1 i1 j0j1 i2 j0j1 i3 j0j1')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('continue statement inside inner loop of a set of nested loops must only enact continue on the inner loop', function (done) { 

        interpret(
          ' var a = ""; for (var i = 0; i < 4; i++) { a += " i" + i + " "; for (var j = 0; j < 4; j++) { if (j === 2) { continue } a += "j" + j;  }  } '
        ).then(function(value) { 
          expect(value).to.equal(' i0 j0j1j3 i1 j0j1j3 i2 j0j1j3 i3 j0j1j3')
          done()
        }).catch(function(err) { 
          done(err)
        })

      })

      it('break inside upper level of nested loops must break the root loop', function(done) { 
        interpret(
          " var a = ''; for (var i = 0; i < 2; i++) { a += ' i' + i + ' '; if (i == 1) { break } for (var j = 0; j < 2; j++) { if (j === 2) { continue } a += 'j' + j;  }  } "
        ).then(function(value) {
          expect(value).to.equal(' i0 j0j1 i1 ')
          done()
        }).catch(function(err) { 
          done(err)
        })
      })

      it('continue inside upper level of nested loops must break the root loop', function(done) { 
        interpret(
          " var a = ''; for (var i = 0; i < 3; i++) { a += ' i' + i + ' '; if (i == 1) { continue } for (var j = 0; j < 2; j++) { if (j === 2) { continue } a += 'j' + j;  }  } "
        ).then(function(value) {
          expect(value).to.equal(' i0 j0j1 i1  i2 j0j1')
          done()
        }).catch(function(err) { 
          done(err)
        })
      })

    })
  })

  it('should be able to do comparison operations', function (done) {

    interpret(
      ' var a = 10; a > 0 '
    ).then(function (value) {
      expect(value).to.equal(true)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to do complex operations', function (done) {

    interpret(
      ' var a = 10; a > 0 && false '
    ).then(function (value) {
      expect(value).to.equal(false)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to do an if else construct', function (done) {

    interpret(
      ' var a = 10; if ( a > 0 ) { var b = true } else { var b = false }; b '
    ).then(function (value) {
      expect(value).to.equal(true)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  describe('member methods', function() { 

    it('Calling an object method should return a value', function (done) {

      interpret(
        ' var obj = (function outer () { return { a: function() { return 3 } } } )(); obj.a() '
      ).then(function (value) {
        expect(value).to.equal(3)
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })
  
    it('should be able to execute a chain of method calls', function (done) {

      interpret(
        ' var pow = { boom: function() { return this }, bang: function() { return "bang!" } }; pow.boom().boom().boom().bang() '
      ).then(function (value) {
        expect(value).to.equal('bang!')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  xdescribe('new keyword', function () {

    it('`new` should recognize arguments array', function (done) {

      interpret(
        'function Argret() { this.args = arguments; this.ret = function(){return this.args}}; var argret = new Argret("foo", "bar"); argret.ret()'
      ).then(function (value) {
        expect(value).to.deep.equal({ '0': 'foo', '1': 'bar' })
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })
  
    it('should bind `this` correctly with the `new` keyword', function (done) {
    
      interpret(
        ' function Pro() {this.a = 5}; Pro.prototype.b = function(){return 10}; var pro = new Pro(); [pro.a, pro.b()] '
      ).then(function (value) {
        expect(value).to.deep.equal([5, 10])
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should not bind prototype to returned objects with `new`', function (done) {
      
      interpret(
        ' function Pro() {return {a: 5}} ; Pro.prototype.b = 10; var pro = new Pro(); [pro.a, pro.b] '
      ).then(function (value) {
        expect(value).to.deep.equal([5, undefined])
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should not bind prototype to returned functions with `new`', function (done) {
      
      interpret(
        ' function Pro() {return function(){return 5}} ; Pro.prototype.b = 10; var pro = new Pro(); [pro(), pro.b] '
      ).then(function (value) {
        expect(value).to.deep.equal([5, undefined])
        done()
      }).catch(function (err) {
        done(err)
      })

    })

  })

  it('should execute recursive returns correctly ', function (done) {
    interpret( 
      ' (function() { (function(){3 + 4})(); return (function() {return 5})()})() ' 
    ).then(function (value) {
      expect(value).to.equal(5)
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('should execute immediately invoking function expression returning "screw"', function (done) {

    interpret(
      ' (function() { return "screw" })() '
    ).then(function (value) {
      expect(value).to.equal('screw')
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('function should recognize arguments array', function (done) {

    interpret(
      'function argret() { return arguments}; argret("foo", "bar")'
    ).then(function (value) {
      expect(value).to.deep.equal({ '0': 'foo', '1': 'bar' })
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('member should recognize arguments array', function (done) {

    interpret(
      'var argcall = { argret: function() {return arguments}}; argcall.argret("foo","bar")'
    ).then(function (value) {
      expect(value).to.deep.equal({ '0': 'foo', '1': 'bar'})
      done()
    }).catch(function (err) {
      done(err)
    })

  })


  xdescribe('built-in functions', function () {

    it('should understand parseInt', function (done) {

      interpret(
        ' var crab = parseInt(" F", 16); crab '
      ).then(function (value) {
        expect(value).to.equal(15)
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

    xit('should understand parseFloat', function (done) {

      interpret(
        ' var fish = parseFloat(20); fish '
      ).then(function (value) {
        expect(value).to.equal(20)
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

  })

  xit('should be able to execute void(0) and return undefined', function (done) {

    interpret(
      ' void(0) '
    ).then(function (value) {
      expect(value).to.equal(undefined)
      done()
    }).catch(function (err) {
      done(err)
    })

  })



  it('should be able to do a method call', function (done) {

    interpret(
      ' var f = { a: function(x) { return this.b + x }, b: 5 }; f.a(5); '
    ).then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) {
      done(err)
    })

  })


  xdescribe('it should be able to handle closures', function () {

    it('should be able to handle a basic closure', function (done) {

      interpret(
        " var egg = function () { var squeegie = 'hawk'; return function () { return squeegie } }; var basket = egg(); basket(); "
      ).then(function (value) {
        expect(value).to.equal('hawk')
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should be able to create closures with classes', function (done) {

      // (function(){
      //    function Jello () {
      //      this.anthropocene = 2;
      //      this.future = function () {
      //        this.anthropocene += 36;
      //      };
      //      this.whodunit = function () {
      //        return this.anthropocene;
      //      }
      //    }
      //    var petri = new Jello();
      //    petri.future();
      //    var dish = new Jello();
      //    dish.future();
      //    dish.future();
      //    return petri.whodunit() + dish.whodunit();
      //  })()

      interpret(
        " (function(){ function Jello () { this.anthropocene = 2; this.future = function () { this.anthropocene += 36; }; this.whodunit = function () { return this.anthropocene; } } var petri = new Jello(); petri.future(); var dish = new Jello(); dish.future(); dish.future(); return petri.whodunit() + dish.whodunit(); })() "
      ).then(function (value) {
        expect(value).to.equal(112)
        done()
      }).catch(function (err) {
        done(err)
      })

    })

    it('should increment root level variable from two levels of closure nesting', function (done) {

      //  (function() {
      //    var a = 5;
      //    function electric () {
      //      return a
      //    };
      //    function eel () {
      //      a++;
      //      return function () {
      //        var b = a++;
      //        return b
      //      };
      //    };
      //    var sunset = eel();
      //    return sunset() + a + electric();
      //  })() 

      interpret(
        "  (function() { var a = 5; function electric () { return a }; function eel () { a++; return function () { var b = a++; return b }; }; var sunset = eel(); return sunset() + a + electric(); })() "
      ).then(function (value) {
        expect(value).to.equal(20)
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('should properly evaluate independent scopes from distinct instances of a single closure', function (done) {

      // ' function snake () {
      //    var eggs = 0;
      //    return function () {
      //      return eggs++
      //    }
      //  };
      //  var salad = snake();
      //  var somberero = snake();
      //  salad().toString()
      //  salad().toString()
      //  salad().toString()
      //  sombrero().toString()
      //  sombrero().toString()
      //  sombrero().toString() '

      interpret(
        ' function snake () { var eggs = 0; return function () { return eggs++ } }; var salad = snake(); var sombrero = snake(); salad().toString() + salad().toString() + salad().toString() + sombrero().toString() + sombrero().toString() + sombrero().toString() '
      ).then(function (value) {
        expect(value).to.equal('012012')
        done()
      }).catch(function (err) {
        done(err)
      })
    })

  })

  describe('primordial/primitive methods', function () {


    xit('should toString a function', function (done) {

      // function leprechaun () {
      //   "leprechaun."
      // }
      // leprechaun.toString() 
  
      interpret(
        ' function leprechaun () { "leprechaun." }; leprechaun.toString() '
      ).then(function (value) {
        expect(value).to.equal('function () { "leprechaun." }')
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })

    xit('should toString a bool', function (done) {

      interpret(
        ' var squaredance = true; squaredance.toString() '
      ).then(function (value) {
        expect(value).to.equal('true')
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })
  
    xit('should execute Number on a string', function (done) {
  
      interpret(
        ' var rabbit = "1"; Number(rabbit) '
      ).then(function (value) {
        expect(typeof value).to.equal('number')
        done()
      }).catch(function (err) {
        done(err)
      })
  
    })


    it('should execute toString properly from a number', function (done) {

      interpret(
        ' var rabbit = 1; rabbit.toString() '
      ).then(function (value) {
        expect(typeof value).to.equal('string')
        done()
      }).catch(function (err) {
        done(err)
      })

    })



  })

  xit('should be able to handle proxy promises', function (done) {

    var global = {
      p: new PromiseInterceptor(function (accept, reject) {
        process.nextTick(function () {
          accept('WORLD')
        })
      })
    }
    var vm = new VM(global)
    vm.compiler.compile("'HELLO ' + p")
    var valuePromise = evaluateWrapper(vm)
    valuePromise.then(function (value) {
      expect(value).to.equal('HELLO WORLD')
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})

xdescribe('development describe', function () {

  xit('should be able to handle proxy promises - 2', function (done) {

    var global = {
      a: [1, 2, 3, 4],
      p: new PromiseInterceptor(function (accept, reject) {
        process.nextTick(function () {
          accept(3)
        })
      })
    }
    var vm = new VM(global)
    vm.compiler.compile('x=1;\n y=2;\nz=x + y, a[p];\n')
    var ast = vm.compiler.ast
    var valuePromise = evaluateWrapper(vm)
    valuePromise.then(function (value) {
      expect(value).to.equal(4)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})
