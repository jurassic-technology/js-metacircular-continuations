
it('should understand to assign undefined to a variable', function(done) {

  interpret(
    ' var a = undefined; a; '
  ).then(function (value) {
    expect(value).to.equal(undefined)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Variable declaration with many declarators succeeds', function (done) {

  interpret(
    ' var a, b; "" + a + b '
  ).then(function(value) {
    expect(value).to.equal('undefinedundefined')
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('Variable declaration succeeds', function (done) {

  interpret(
    ' var a; a '
  ).then(function (value) {
  expect(value).to.be.undefined
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Basic variable assignemnt works', function (done) {
  interpret(
    ' var a = 5; a'
  ).then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it('Variable assignemnt to an object works', function (done) {

  interpret(
    'var a = { a: 1, b: 2, c: 3 }; a '
  ).then(function (value) {
    expect(value).to.deep.equal({ a: 1, b: 2, c: 3 })
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Variable assignment should evaluate undefined back into the console', function (done) {

  interpret(
    'var a = 5; '
  ).then(function (value) {
    expect(value).to.equal(undefined)
    done()
  }).catch( function (err) {
    done(err)
  })

})
