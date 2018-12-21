const commons = require('./commons')
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 

it('should be able to create an object', function (done) {

  new AsyncInterpreter(
    ' var a = { b:1, c:2 }; a '
  ).evaluate().then(function (value) {
    expect(value.b).to.equal(1)
    expect(value.c).to.equal(2)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should be able xo create an object with a getter', function (done) {

  new AsyncInterpreter(
    ' var a = { get b () { var a = 5; var c = 5; return this.z } }  '
  ).evaluate().then( (val) => {
    done()
  }).catch( (err) => {
    done(err)
  })

})


it('should be able to create an object with a getter that works', function (done) {

  new AsyncInterpreter(
    ' var a = { get a () { return 5 } }; a.a '
  ).evaluate().then( (val) => {
    expect(val).to.equal(5)
    done()
  }).catch( (err)=>{
    done(err)
  })

})

it.only('should be able to create an object with a setter property that works', function (done) {

  new AsyncInterpreter(
    'var a = { set a (x) { this._a = x } }; a._a = 5; '
  ).evaluate().then( (value) => {
    expect(value).to.equal(5) 
    done()
  }).catch( (err) => { 
    done(err)
  }) 


})

it('a getter property instantiated with a getter method expression should work', function (done) {

  new AsyncInterpreter(
    ' var a = { get a () { return 5 } }; a.a; '

  ).evaluate().then( (val) => {
    done()
  }).catch( (err) => {
    done(err)
  })

})
