const common = require('./commons')
console.log('hello')
const AsyncInterpreter = common.AsyncInterpreter
const expect = common.expect


it('Accessing nth element of an array should return given value', function (done) {

  new AsyncInterpreter(
    ' var arr = [0,1,2,3,4]; arr[3] '
  ).evaluate().then(function (value) {
    expect(value).to.equal(3)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Computed/bracket assignemnt of an object\'s property should assign successfully', function (done) {

  new AsyncInterpreter(
    ' var boat = {}; boat["box"] = "box"; boat["box"]; '
  ).evaluate().then(function (value) {
    done()
  }).catch(function (err) {
    done(err);
  })

})


