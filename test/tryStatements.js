const commons = require('./commons') 
const AsyncInterpreter = commons.AsyncInterpreter 
const expect = commons.expect 

it('try catch block should execute the catch block', function (done) {

  new AsyncInterpreter(
    ' try { a } catch (e) { 55 } '
  ).evaluate().then(function (value) {
    expect(value).to.equal(55)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('catch block should receive error parameter', function (done) {

  new AsyncInterpreter(
    ' try { a } catch (e) { e } '
  ).evaluate().then(function (value) {
    expect(value instanceof ReferenceError).to.be.true
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('runs code after a catch block ', function (done) {

  new AsyncInterpreter(
    ' try { a } catch (e) { e } 55 '
  ).evaluate().then(function (value) {
    expect(value).to.equal(55)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('finally block executes without catch block', function (done) {

  new AsyncInterpreter(
    ' var z; try { a } finally { z = 500 } z '
  ).evaluate().then(function(value) {
    expect(value).to.equal(500)
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('finally block excecutes with catch block', function (done) {

  new AsyncInterpreter(
    ' var z;  try { a } catch (e) { e } finally { z = 500 }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal(500)
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('catch block changes outer scope variable ', function (done) {

  new AsyncInterpreter(
    ' var z = 9; try { a } catch (e) { z = 18 }; z '
  ).evaluate().then(function(value) {
    expect(value).to.equal(18)
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('creates an instance of a constructor inside try/catch', function(done) {
  new AsyncInterpreter(
    ' function Bat () { this.a = function () { return 99 } }; try { asdf } catch (e) { var bat = new Bat(); bat.a() } '
  ).evaluate().then(function(value) {
    expect(value).to.equal(99)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it('catch block returns a value from a function', function(done) {

  new AsyncInterpreter(
    ' function test() { try { a } catch(e) { return 5 } }; test() '
  ).evaluate().then(function(value) {
    expect(value).to.equal(5)
    done()
  }).catch(function(err) {
    done(err)
  })

})


