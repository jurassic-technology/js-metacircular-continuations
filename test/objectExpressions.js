
it('should be able to create an object', function (done) {

  interpret(
    ' var a = { b:1, c:2 }; a '
  ).then(function (value) {
    expect(value.b).to.equal(1)
    expect(value.c).to.equal(2)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it.only('should be able xo create an object with a getter', function (done) {

  interpret(
    ' var a = { get b () { var a = 5; var c = 5; return this.z }, set b (x) { var a = 5; this.z = x } }  '
  ).then( (val) => {
    done()
  }).catch( (err) => {
    done(err)
  })

})

