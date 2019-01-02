const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect 

it('should be able to do a for loop', function (done) {
  new AsyncInterpreter(
    ' var a = 10; for ( var i = 0; i <= a; i++ ) { i }'
  ).evaluate().then(function (value) {
    expect(value).to.equal(10);
    done()
  }).catch(function (err) {
    done(err)
  })
})

xit('should use a separate closure for the invocation of a constructor in each loop', function (done) {

  new AsyncInterpreter(
    ' function Class() { this.a = 5; this.b = function () { this.a++; return this.a } }; var z = ""; for (var i = 0; i < 2; i++) { var thing = new Class(); z += thing.b(); z += thing.b() } z '
  ).evaluate().then(function(value){
    expect(value).to.equal('6767')
    done()
  }).catch(function(err) {
    done(err)
  })

})


it('should be able to do a basic for loop with continue statement', function (done) {
  new AsyncInterpreter(
    ' var a = ""; for(var i = 0; i < 2; i++) { if (i == 1) { continue } a += i } '
  ).evaluate().then(function(value) {
    expect(value).to.equal('0')
    done()
  }).catch( function(err) {
    done(err)
  })
})

it('should be able to do a basic for loop with break statement', function (done) {
  new AsyncInterpreter(
    ' var a = ""; for (var i = 0; i < 1; i++) { a += i; if (i === 0) { break } }; a '
  ).evaluate().then(function(value) {
    expect(value).to.equal('0')
    done()
  }).catch(function(err) {
    done(err)
  })
})

it('break statement inside inner loop of a set of nested loops must only break the inner loop', function (done) {

  new AsyncInterpreter(
    'var a = ""; for (var i = 0; i < 4; i++) { a += " i" + i + " "; for (var j = 0; j < 4; j++) { if (j === 2) { break } a += "j" + j;  }  } '
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i0 j0j1 i1 j0j1 i2 j0j1 i3 j0j1')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('continue statement inside inner loop of a set of nested loops must only enact continue on the inner loop', function (done) {

  new AsyncInterpreter(
    ' var a = ""; for (var i = 0; i < 4; i++) { a += " i" + i + " "; for (var j = 0; j < 4; j++) { if (j === 2) { continue } a += "j" + j;  }  } '
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i0 j0j1j3 i1 j0j1j3 i2 j0j1j3 i3 j0j1j3')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('break inside upper level of nested loops must break the root loop', function(done) {
  new AsyncInterpreter(
    " var a = ''; for (var i = 0; i < 2; i++) { a += ' i' + i + ' '; if (i == 1) { break } for (var j = 0; j < 2; j++) { if (j === 2) { continue } a += 'j' + j;  }  } a; "
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i0 j0j1 i1 ')
    done()
  }).catch(function(err) {
    done(err)
  })
})

it('continue inside upper level of nested loops must break the root loop', function(done) {
  new AsyncInterpreter(
    " var a = ''; for (var i = 0; i < 3; i++) { a += ' i' + i + ' '; if (i == 1) { continue } for (var j = 0; j < 2; j++) { if (j === 2) { continue } a += 'j' + j;  }  } a; "
  ).evaluate().then(function(value) {
    expect(value).to.equal(' i0 j0j1 i1  i2 j0j1')
    done()
  }).catch(function(err) {
    done(err)
  })
})
