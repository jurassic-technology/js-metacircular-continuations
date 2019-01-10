const commons = require('./commons')
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 


it('should eval a simple arithmetic expression', function (done) {
  
  new AsyncInterpreter(
    'eval("2+3") '
  ).evaluate().then(function (result) {
    expect(result).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  }) 

})


it('eval should be able to call function in current level scope', function (done) {

  new AsyncInterpreter(
    ' function a () { return 5 }; eval("a()"); '
  ).evaluate().then(function (result) {
    expect(result).to.equal(5)
    done()
  }).catch(function (err) { 
    done(err) 
  }) 


}) 


it('initiating a variable to eval and then using it should work', function (done) {

  new AsyncInterpreter(
    ' var a = eval; a("2+3"); '
  ).evaluate().then(function (result) {
    expect(result).to.equal(5)
    done()
  }).catch(function (err) { 
    done(err) 
  }) 

})


it('initiating a variable to eval and trying to access a nested scope should fail', function (done) {

  new AsyncInterpreter(
    ' function z () { var a = eval; var b = 5; return a("b"); } z(); '
  ).evaluate().then(function (result) { 
    console.log('result', result)  
  }).catch(function (err) {
    expect(err instanceof ReferenceError).to.be.true
    done() 
  }) 

}) 
