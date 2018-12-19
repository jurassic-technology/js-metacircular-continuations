it('Object fields should be accessible through `this`', function (done) {

  interpret(
    ' var obj = ( function outer () { return { b: 3, a: function() { return this.b } } } )(); obj.a() '
  ).then(function (value) {
    expect(value).to.equal(3)
    done()
  }).catch(function (err) {
    done(err)
  })

})


