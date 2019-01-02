const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect

describe('delete operator', function () {

  it('delete operator should be able to delete an array element', function (done) {

    new AsyncInterpreter(
      ' var cobra = [1,2,3]; delete cobra[1]; cobra; '
    ).evaluate().then(function (value) {
      expect(value[1]).to.be.undefined
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('delete operator should be able to delete property on object declared with var', function (done) {

    new AsyncInterpreter(
      ' var cobra = { rattle: true }; delete cobra.rattle; cobra; '
    ).evaluate().then(function (value) {
      expect(value.rattle).to.be.undefined
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('delete operator should be able to property on object declared with var', function (done) {

    new AsyncInterpreter(
      ' var cobra = { rattle: true }; delete cobra.rattle; cobra; '
    ).evaluate().then(function (value) {
      expect(value.rattle).to.be.undefined
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  xit('delete operator cannot delete properties on native objects', function (done) {

    new  AsyncInterpreter(
      ' delete Math.PI; Math.PI '
    ).evaluate().then(function (value) {
      expect(value).to.equal(Math.PI)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})



