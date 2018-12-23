const commons = require('./commons')
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect

it('increment operator should work', function (done) {

  new AsyncInterpreter(
    ' var goose = 5; goose++; goose '
  ).evaluate().then(function (value) {
    expect(value).to.equal(6)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('decrement operator should work', function (done) {

  new AsyncInterpreter(
    ' var falcon = 101; falcon--; falcon '
  ).evaluate().then(function (value) {
    expect(value).to.equal(100)
    done()
  }).catch(function (err) {
    done(err)
  })

})

