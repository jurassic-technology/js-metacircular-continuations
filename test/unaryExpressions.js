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

it('unary negative sign should work', function (done) {

  new AsyncInterpreter(
    ' -55; '
  ).evaluate().then(function (value) {
    expect(value).to.equal(-55)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('bitwise NOT should work', function (done) {

  new AsyncInterpreter(
    ' ~100 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(-101)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('unary negation should work', function (done) {

  new  AsyncInterpreter(
    '!0'
  ).evaluate().then(function (value){
    expect(value).to.be.true
    done()
  }).catch(function (err)  { 
    done(err)
  }) 

})

it('unary void should work', function (done) {

  new  AsyncInterpreter(
    'void 5'
  ).evaluate().then(function (value){
    expect(value).to.be.undefined
    done()
  }).catch(function (err)  { 
    done(err)
  }) 

})

it('unary typeof should work', function (done) {

  new  AsyncInterpreter(
    'typeof 5'
  ).evaluate().then(function (value){
    expect(value).to.equal('number') 
    done()
  }).catch(function (err)  { 
    done(err)
  }) 

})

