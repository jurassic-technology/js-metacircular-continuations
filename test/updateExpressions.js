it('increment operator should work', function (done) {

  interpret(
    ' var goose = 5; goose++; goose '
  ).then(function (value) {
    expect(value).to.equal(6)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('decrement operator should work', function (done) {

  interpret(
    ' var falcon = 101; falcon--; falcon '
  ).then(function (value) {
    expect(value).to.equal(100)
    done()
  }).catch(function (err) {
    done(err)
  })

})

