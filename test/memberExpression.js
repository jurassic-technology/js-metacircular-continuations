it('Accessing nth element of an array should return given value', function (done) {

  interpret(
    ' var arr = [0,1,2,3,4]; arr[3] '
  ).then(function (value) {
    expect(value).to.equal(3)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('Computed/bracket assignemnt of an object\'s property should assign successfully', function (done) {

  interpret(
    ' var boat = {}; boat["box"] = "box"; boat["box"]; '
  ).then(function (value) {
    done()
  }).catch(function (err) {
    done(err);
  })

})

