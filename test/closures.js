it('Repeated closure calls create intermediate scopes', function (done) {

  interpret(
    ' function new_close() { var a = 1; return function() { a = a + 1;  return a } }; var q = new_close(); q(); [q(),(new_close())()] '
  ).then(function (value) {
    expect(value).to.deep.equal([3, 2])
    done()
  }).catch(function (err) {
    done(err)
  })

})

