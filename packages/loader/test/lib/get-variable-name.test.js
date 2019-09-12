const { expect } = require('chai');
const getVariableName = require('../../src/lib/get-variable-name');

describe('test #getVariableName', () => {
  it('should get correctly from ./settings', () => {
    const result = getVariableName('./settings');
    expect(result).to.match(/V\d+Settings/);
  });

  it('should get correctly from ./settings.tsx', () => {
    const result = getVariableName('./settings.tsx');
    expect(result).to.match(/V\d+Settings/);
  });

  it('should get correctly from ./system/settings.tsx', () => {
    const result = getVariableName('./system/settings.tsx');
    expect(result).to.equal('SystemSettings');
  });

  it('should get correctly from ./system/router.js', () => {
    const result = getVariableName('./system/router.js');
    expect(result).to.equal('System');
  });

  it('should get correctly from ./system/router.ts', () => {
    const result = getVariableName('./system/router.ts');
    expect(result).to.equal('System');
  });

  it('should get correctly from ./system/index.js', () => {
    const result = getVariableName('./system/index.js');
    expect(result).to.equal('System');
  });

  it('should get correctly from ./system/0-1.js', () => {
    const result = getVariableName('./system/0-1.js');
    expect(result).to.equal('System01');
  });

  it('should get correctly from ./0-1.js', () => {
    const result = getVariableName('./0-1.js');
    expect(result).to.match(/V\d+01/);
  });

  it('should get correctly even if none', () => {
    const result = getVariableName();
    expect(result).to.match(/V\d+/);
  });
});
