function xtest (name, path) { xdescribe(name, function () { require(path) }) }
function test (name, path) { describe(name, function () { require(path) }) }
test.only = function (name, path) { describe.only(name, function () { require(path) }) }

describe('Async Interpreter Tests', function () {

  test('functions', './functions') 
  test('variable declarations', './variableDeclarations') 
  test('member expressions', './memberExpressions') 
  test('object expressions', './objectExpressions') 
  test('update expressions', './updateExpressions') 
  test('try statements', './tryStatements') 
  test('new expressions', './newExpressions') 
  test('conditional expressions  (ternary)', './conditionalExpressions') 
  test('unary expressions', './unaryExpressions') 
  test('binary expressions', './binaryExpressions') 
  test('do while loop', './doWhileLoop') 
  test('while loop', './whileLoops')
  test('for in loops', './forInLoops') 
  test('for of loops', './forOfLoops') 
  test('for loops', './forLoops')
  test('eval function', './eval') 

})
