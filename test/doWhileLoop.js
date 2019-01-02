const  common = require('./commons') 
const AsyncInterpreter = common.AsyncInterpreter
const expect = common.expect


it('should be able to do a basic do while loop', function (done) {

  new AsyncInterpreter(
    ' var i = 0; do { i++ } while ( i <= 5 ) '
  ).evaluate().then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should understand to break a do while loop', function(done) {
  new AsyncInterpreter(
    ' var i = 0; do { if (i === 2) { break } i++ } while ( i <= 5 ) '
  ).evaluate().then(function (value) {
    expect(value).to.equal(1)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it('should understand continue in a do while loop', function(done) {

  new AsyncInterpreter(
    ' var z = "", i = 0; do { i++; if (i === 2) { continue } z += i } while ( i <= 2 ); z '
  ).evaluate().then(function (value) {
    expect(value).to.equal('13')
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should understand to break a nested do while loop', function (done) {

  new AsyncInterpreter(
    " var i = 0; var j = 0; var z = ''; do { j = 0; i++; z += ' i' + i; do { j++; if (j == 2) { break } z += ' j' + j } while (j < 3) } while (i < 4); z "
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i1 j1 i2 j1 i3 j1 i4 j1')
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('should understand continue in a nested do while loop', function (done) {

  new AsyncInterpreter(
    " var i = 0; var j = 0; var z = ''; do { j = 0;  i++; z += ' i' + i; do { j++; if (j == 2) { continue } z += ' j' + j } while (j < 3) } while (i < 4) "
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i1 j1 j3 i2 j1 j3 i3 j1 j3 i4 j1 j3')
    done()
  }).catch(function (err) {
    done(err)
  })

})

