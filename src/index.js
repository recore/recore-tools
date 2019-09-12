const AST = require('./ast');
const transform = require('./transform');

function fromFile(fileName, autoMock) {
  const ast = new AST();
  ast.fromFile(fileName);
  const finalCode = transform(ast, autoMock);
  return finalCode;
}

function fromCode(fileName, code, autoMock) {
  const ast = new AST();
  ast.fromCode(code, fileName);
  const finalCode = transform(ast, autoMock);
  return finalCode;
}

module.exports.fromCode = fromCode;
module.exports.fromFile = fromFile;
