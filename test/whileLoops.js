
const common = require('./commons') 
const AsyncInterpreter = common.AsyncInterpreter
const expect = common.expect

it('should be able to do a while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 10, i = 0; while (i<a) { i++; i; } '
  ).evaluate().then(function (value) {
    expect(value).to.equal(10);
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should recognize continue in a while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 10, i = 0, z = ""; while (i < a) { i++; if ( i % 2 == 0 ) { continue }; z += i } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal('13579');
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should recognize a break statement in a while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 10, i = 0, z = ""; while (i < a) { i++; if ( i == 3 ) { break }; z += i } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal('12');
    done()
  }).catch(function (err) {
    done(err)
  })

})



it('should recognize a break statement for an inner while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 5, j = 0, i = 0, z = ""; while (i < a) { i++; while (j < a) { j++; if ( j == 3 ) { break }; z += " j" + j } z += " i" + i } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal(' j1 j2 i1 j4 j5 i2 i3 i4 i5');
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should recognize a continue statement on an inner while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 5, b = 3, j = 0, i = 0, z = ""; while (i < b) { i++; z += " i" + i; while (j < a) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal(' i1 j1 j2 j4 j5 i2 i3');
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should recognize a continue statement on an outer while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 5, b = 3, j = 0, i = 0, z = ""; while (i < a) { i++; if ( i % 2 > 0 ){ continue }; z += " i" + i; while (j < b) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal(' i2 j1 j2 i4');
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should recognize a break statement on an outer while loop', function (done) {

  new AsyncInterpreter(
    ' var a = 5, b = 3, j = 0, i = 0, z = ""; while (i < a) { i++; if ( i === 2 ){ break }; z += " i" + i; while (j < b) { j++; if ( j == 3 ) { continue }; z += " j" + j } } z '
  ).evaluate().then(function (value) {
    expect(value).to.equal(' i1 j1 j2');
    done()
  }).catch(function (err) {
    done(err)
  })

})


