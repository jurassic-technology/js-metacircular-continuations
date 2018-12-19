describe('vanilla function calls', function () {


  it('function should accept undefined as an argument and return it',  function (done) {

    interpret(
      ' function test(a) { return a }; test(undefined); '
    ).then(function(value) {

      expect(value).to.equal(undefined)
      done()

    }).catch(function (err) { done(err) })

  })

  it('Function returning "zult" should return "zult"', function (done) {

    interpret(
      'function crashTest () { return "zult" }; crashTest() '
    ).then(function (value) {
      expect(value).to.equal('zult')
      done()
    }).catch(function (err) { done(err) }) 
  })

  it('declared function can accept a property after being called', function (done) {

    interpret(
      ' function one() {};  one();  one.two = 3; one.two '
    ).then(function (value) {
      expect(value).to.equal(3)
      done()
    }).catch(function (err) { done(err) })

  })

}) 

describe('bind', function () {

  it('a function should have a .bind method attached', function (done) {

    interpret(
      ' function stew () {}; stew.bind '
    ).then(function (value) {
      expect(value).to.equal(global.stew.bind)
      done()
    }).catch(function (err) { done(err) })

  })

  it('.bind should bind `this` and return a new function', function (done) {

    interpret(
      '(function(b, c, d) {return this.a + b + c + d}).bind({a: 1})(2, 3, 4)'
    ).then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) { done(err) })

  })

  it('should execute .bind properly', function (done) {

    interpret(
      ' var javelin = { hippos: 33 }; function silk () { return this.hippos }; var worms = silk.bind(javelin); worms(); '
    ).then(function (value) {
      expect(value).to.equal(33)
      done()
    }).catch(function (err) { done(err) })

  })

  it('should execute .bind repeatedly with arguments', function (done) {

    interpret(
      '(function(foo,bar,baz,bux){return arguments}).bind(null, 2).bind(null,3)(4,5)'
    ).then(function (value) {
      expect(value).to.deep.equal({ '0': 2, '1': 3, '2': 4, '3': 5 })
      done()
    }).catch(function (err) { done(err) })

  })

  it('should isolate repeated partial application of arguments with .bind', function (done) {

    interpret(
      'function binder(a,b,c,d){return a + b + c + d}; var half = binder.bind(null, 1,2); [half.bind(null,3,4)(),half(4,5)]'
    ).then(function (value) {
      expect(value).to.deep.equal([10,12])
      done()
    }).catch(function (err) { done(err) })

  })


})

describe('apply', function () {

  it('.apply should bind `this` and unroll arguments array', function (done) {

    interpret(
      '(function(b, c, d) {return this.a + b + c + d}).apply({a: 1}, [2,3,4])'
    ).then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should execute .apply properly concerning arguments', function (done) {

    interpret(
      ' var safari = function (a,b,c) { return a + b + c }; safari.apply(null,[1,2,3]) '
    ).then(function (value) {
      expect(value).to.equal(6)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  xit('should execute .apply properly concerning the this keyword', function (done) {

    interpret(
      ' var hunt = function () { return this.swordfish }; var starfish = { swordfish: 99 }; hunt.apply(starfish) '
    ).then(function (value) {
      expect(value).to.equal(99)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})



describe('call', function () {

  it('.call should bind `this` and copy remaining arguments', function (done) {

    interpret(
      '(function(b, c, d) {return this.a + b + c + d}).call({a: 1}, 2, 3, 4)'
    ).then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  xit('a function should have a .call method attached', function (done) {

    interpret(
      ' function stew () { }; stew.call '
    ).then(function (value) {
      expect(value).to.equal(global.stew.call)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should execute .call properly', function (done) {

    interpret(
      ' var crocodile = { swan: 55 }; function ghostbusters() { return this.swan }; ghostbusters.call(crocodile) '
    ).then(function (value) {
      expect(value).to.equal(55)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})


