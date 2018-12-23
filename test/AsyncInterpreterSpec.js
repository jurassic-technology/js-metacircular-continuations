function xtest (name, path) { xdescribe(name, function () { require(path) }) }
function test (name, path) { describe(name, function () { require(path) }) }
test.only = function (name, path) { describe.only(name, function () { require(path) }) }

describe('Async Interpreter Tests', function () {

  test('functions', './functions') 
  test('variable declarations', './variableDeclarations') 
  test('member expressions', './memberExpressions') 
  test('object expressions', './objectExpressions') 
  test('update expressions', './updateExpressions') 

})
