const { join } = require('path');
const { readFileSync } = require('fs');
const { default: template } = require('@babel/template');
const t = require('@babel/types');


function read() {
  return readFileSync(join(__dirname, './spm-function.template.js'), { encoding: 'utf8' });
}

function generateAst(spmA) {
  const templateFuncString = read();
  return template(templateFuncString)({
    SPMA: t.stringLiteral(spmA),
  });
}

module.exports = generateAst;
