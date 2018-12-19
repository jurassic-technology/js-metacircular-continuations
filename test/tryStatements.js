it('try catch block should execute the catch block', function (done) {

  interpret(
    ' try { a } catch (e) { 55 } '
  ).then(function (value) {
    expect(value).to.equal(55)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('catch block should receive error parameter', function (done) {

  interpret(
    ' try { a } catch (e) { e } '
  ).then(function (value) {
    expect(value instanceof ReferenceError).to.be.true
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('runs code after a catch block ', function (done) {

  interpret(
    ' try { a } catch (e) { e } 55 '
  ).then(function (value) {
    expect(value).to.equal(55)
    done()
  }).catch(function (err) {
    done(err)
  })

})

it('finally block executes without catch block', function (done) {

  interpret(
    ' try { a } finally { 500 } '
  ).then(function(value) {
    expect(value).to.equal(500)
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('finally block excecutes with catch block', function (done) {

  interpret(
    ' try { a } catch (e) { e } finally { 500 } '
  ).then(function(value) {
    expect(value).to.equal(500)
    done()
  }).catch(function(err) {
    done(err)
  })

})

it('catch block changes outer scope variable ', function (done) {

  interpret(
    ' var z = 9; try { a } catch (e) { z = 18 }; z '
  ).then(function(value) {
    expect(value).to.equal(18)
    done()
  }).catch(function(err) {
    done(err)
  })

})

