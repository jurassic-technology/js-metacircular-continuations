it('should evaluate an empty array', function (done) {

  interpret(
    ' [] '
  ).then(function (value)  {
    expect(value).to.deep.equal([])
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('Array of null values should interpret to an array of null values', function (done) {

  interpret(
    ' [,,,] '
  ).then(function (value) {
    expect(value).to.deep.equal([null, null, null])
    done()
  }).catch(function (err) {
    done(err)
  })

})


it('Array with pre elisions should evaluate', function (done) {

  interpret(
    ' [ , , , 1 ] '
  ).then(function(value) {
     expect(value).to.deep.equal([ null, null, null, 1 ])
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('Array with post elisions should evaluate', function (done) {

  interpret(
    ' [ 1 , , , ] '
  ).then(function(value) {
     expect(value).to.deep.equal([ 1, null, null, ])
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('Array with pre, post and middle ellisions should evaluate', function (done) {

  interpret(
    ' [ , , 1, , 1, , , 1, 1, 1, , , , ] '
  ).then(function (value) {

    expect(value).to.deep.equal([ null, null, 1, null, 1, null, null, 1, 1, 1, null, null, null ])
    done()

  }).catch(function (err) {

    done(err)

  })

})

