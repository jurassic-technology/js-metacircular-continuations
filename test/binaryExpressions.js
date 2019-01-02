const commons = require('./commons')
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 


it('bitwise AND should work', function (done) {

  new AsyncInterpreter(
    ' 2 & 6 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(2)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('bitwise OR should work', function (done) {

  new AsyncInterpreter(
    ' 2 | 8 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(10)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('bitwise XOR should work', function (done) {

  new  AsyncInterpreter(
    ' 2 ^ 8 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(10)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('bitwise left shift should work', function (done) {

  new AsyncInterpreter(
    ' 9 << 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(36)
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('bitwise right shift should work', function (done) {

  new  AsyncInterpreter(
    ' 9 >> 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(2)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('bitwise zero-fill right shift should work', function (done) {

  new  AsyncInterpreter(
    ' 9 >>> 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(2)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('subtraction operator should work', function (done) {

  new AsyncInterpreter(
    ' 2 - 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(0)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('addition operator should work', function (done) {

  new AsyncInterpreter(
    ' 2 + 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(4)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('multiplication operator should work', function (done) {

  new AsyncInterpreter(
    ' 2 * 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(4)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('division operator should work', function (done) {

  new AsyncInterpreter(
    ' 2 / 2 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(1)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('remainder operator should work', function (done) {

  new AsyncInterpreter(
    ' 4 % 3 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(1)
    done()
  }).catch(function (err) {
    done(err)
  })

})

