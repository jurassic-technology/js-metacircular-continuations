const common = require('./commons')
const AsyncInterpreter = common.AsyncInterpreter
const expect = common.expect 


xit('should use a separate closure for the invocation of a constructor in each loop', function (done) {

  new AsyncInterpreter(
    ' var a = { a:1, b:2 }; function Class() { this.a = 5; this.b = function () { this.a++; return this.a } }; var z = ""; for (var key in a) { var thing = new Class(); z += thing.b(); z += thing.b() } z '
  ).evaluate().then(function(value){
    expect(value).to.equal('6767')
    done()
  }).catch(function(err) {
    done(err)
  })

})



it('should be able to do a for in loop', function(done) {

  new AsyncInterpreter(
    ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { z += key } '
  ).evaluate().then(function(value) {
    expect(value).to.equal('abc')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a break statement in a basic for in loop', function(done) {

  new AsyncInterpreter(
    ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { if (key === "c") { break } z += key } z '
  ).evaluate().then(function(value) {
    expect(value).to.equal('ab')
    done()
  }).catch(function(err) {
    done(err)
  })

})


it('should recognize a continue statement in a basic for in loop', function(done) {

  new AsyncInterpreter(
    ' var obj = { a: 1, b: 2, c: 3 }; var z = ""; for (var key in obj) { if (key === "b") { continue } z += key } '
  ).evaluate().then(function(value) {
    expect(value).to.equal('ac')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a break statement inside a nested for in loop', function (done) {

  new AsyncInterpreter(
    ' var z = ""; var obj = { a: 1, b: 2, c: 3 }; for (var key in obj) { for (var key2 in obj) { if (key2 === "b") { break } z += " inner" + key2 } z += " outer" + key } '
  ).evaluate().then(function(value) {
    expect(value).to.equal(' innera outera innera outerb innera outerc')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('should recognize a break statement inside a nested for in loop', function (done) {

  new AsyncInterpreter(
    ' var z = ""; var obj = { a: 1, b: 2, c: 3 }; for (var key in obj) { for (var key2 in obj) { if (key2 == "b") { continue } z += " inner" + key2 } z += " outer" + key } '
  ).evaluate().then(function (value) {
    expect(value).to.equal(' innera innerc outera innera innerc outerb innera innerc outerc')
    done()
  }).catch(function (err) {
    done(err)
  })

})


