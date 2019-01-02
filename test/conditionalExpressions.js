const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 

it('evaluates a falsy ternary', function (done) {

  new AsyncInterpreter(
    ' false ? 5 : 6 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(6)
    done()
  }).catch(function (err) {
    done(err)
  })   

})   

it('evaluates a truthy ternary', function (done) {

  new AsyncInterpreter(
    ' true ? 5 : 6 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })   

})   
