
const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect

it('should understand to assign undefined to a variable', function(done) {

  new AsyncInterpreter(
    ' var a = undefined; a; '
  ).evaluate().then(function (value) {
    expect(value).to.equal(undefined)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Variable declaration with many declarators succeeds', function (done) {

  new AsyncInterpreter(
    ' var a, b; "" + a + b '
  ).evaluate().then(function(value) {
    expect(value).to.equal('undefinedundefined')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('Variable declaration succeeds', function (done) {

  new AsyncInterpreter(
    ' var a; a '
  ).evaluate().then(function (value) {
  expect(value).to.be.undefined
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Basic variable assignemnt works', function (done) {
  new AsyncInterpreter(
    ' var a = 5; a'
  ).evaluate().then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it.only('Variable assignemnt to an object works', function (done) {

  new AsyncInterpreter(
    'var a = { a: 1, b: 2, c: 3 }; a '
  ).evaluate().then(function (value) {
    expect(value).to.deep.equal({ a: 1, b: 2, c: 3 })
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Variable assignment should evaluate undefined back into the console', function (done) {

  new AsyncInterpreter(
    'var a = 5; '
  ).evaluate().then(function (value) {
    expect(value).to.equal(undefined)
    done()
  }).catch( function (err) {
    done(err)
  })

})
