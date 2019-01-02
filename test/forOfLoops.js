const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 

it('should be able to do a for of loop', function (done ) {

  new AsyncInterpreter(
    ' var a = [ 1, 2, 3]; var z = ""; for (var key of a) { z += key }; z '
  ).evaluate().then(function(value){
    expect(value).to.equal('123')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a continue in a for of loop', function (done) {

  new AsyncInterpreter(
    ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { if (key === 2) { continue } z += key }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('13')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a break statement in a for of loop', function (done) {

  new AsyncInterpreter(
    ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { if (key === 2) { break } z += key }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('1')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should run a nested for of loop', function (done) {

  new AsyncInterpreter(
    ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { z += key2 } }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('112321233123')
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should recognize a break statement in a nested for of loop', function (done) {

  new AsyncInterpreter(
    ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { if (key2 === 2) { break }; z += key2 } }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('112131')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a continue in a nested for of loop', function(done) {

  new AsyncInterpreter(
    ' var a = [ 1,2,3 ]; var z = ""; for (var key of a) { z += key; for (var key2 of a) { if (key2 === 2) { continue }; z += key2 } }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('113213313')
    done()
  }).catch(function(err) {
    done(err)
  })

})

