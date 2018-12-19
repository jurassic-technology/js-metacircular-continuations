it('Assignment happens in parent scope', function (done) {

  interpret(
    ' var a = 5; (function() { a = 10; return a})(); a '
  ).then(function (value) {
    expect(value).to.equal(10)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it('Var assignments happen in current scope', function (done) {

  interpret(
    ' var a = 5; (function() { var a = 10; return a})(); a '
  ).then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Assignment happens in parent scope, no return statement', function (done) {

  interpret(
    ' var a = 5; (function() { a = 3 })(); a '
  ).then(function (value) {
    expect(value).to.equal(3)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Var assignments happen in current scope, no return statement', function (done) {

  interpret(
    ' var a = 5; (function() { var a = 10})(); a '
  ).then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })

})

