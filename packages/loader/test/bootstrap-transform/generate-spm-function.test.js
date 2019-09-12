const { expect } = require('chai');

const { default: generate } = require('@babel/generator');
const generateAst = require('../../src/transform/bootstrap/generate-spm-function-ast');

describe('#generate-spm-function', () => {
  it('#generate', () => {
    const spmA = 'acb123';
    const ast = generateAst(spmA);
    const { code } = generate(ast[1]);
    expect(code).to.includes(`("${spmA}")`);
  });
});
