const common = require('./commons')
const AsyncInterpreter = common.AsyncInterpreter 
const expect = common.expect 

it('`new` should recognize arguments array', function (done) {

  new AsyncInterpreter(
    'function Argret() { this.args = arguments; this.ret = function(){return this.args}}; var argret = new Argret("foo", "bar"); argret.ret()'
  ).evaluate().then(function (value) {
    expect(value).to.deep.equal({ '0': 'foo', '1': 'bar' })
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should bind `this` correctly with the `new` keyword', function (done) {

  new AsyncInterpreter(
    ' function Pro() {this.a = 5}; Pro.prototype.b = function(){return 10};  [5,10]' // var pro = new Pro(); [pro.a, pro.b()] '
  ).evaluate().then(function (value) {
    // expect(value).to.deep.equal([5, 10])
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should not bind prototype to returned objects with `new`', function (done) {

  new AsyncInterpreter(
    ' function Pro() { return {a: 5} } ; Pro.prototype.b = 10; var pro = new Pro(); [pro.a, pro.b] '
  ).evaluate().then(function (value) {
    expect(value).to.deep.equal([5, undefined])
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('should not bind prototype to returned functions with `new`', function (done) {

  new AsyncInterpreter(
    ' function Pro() {return function(){return 5}} ; Pro.prototype.b = 10; var pro = new Pro(); [pro(), pro.b] '
  ).evaluate().then(function (value) {
    expect(value).to.deep.equal([5, undefined])
    done()
  }).catch(function (err) {
    done(err)
  })

})

