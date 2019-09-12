const { expect } = require('chai');
const { judgeIsVXEntry } = require('../../../src/lib/util');


describe('lib/util test #judgeIsVXEntry', () => {
  it('#index.js', () => {
    const isEntry = judgeIsVXEntry('./about/index.vx', '/hello-recore/src/pages/settings/about');
    expect(isEntry);
  });

  it('#filename-same-as-dirname-1', () => {
    const isEntry = judgeIsVXEntry('./about/about.vx', '/hello-recore/src/pages/settings/about');
    expect(isEntry);
  });

  it('#filename-same-as-dirname-2', () => {
    const isEntry = judgeIsVXEntry('./about.vx', '/hello-recore/src/pages/settings/about');
    expect(isEntry);
  });

  it('#other-filename', () => {
    const isEntry = judgeIsVXEntry('./vx-1-2.vx', '/hello-recore/src/pages/settings/about');
    expect(isEntry).to.equal(false);
  });

  it('#other-filename-js', () => {
    const isEntry = judgeIsVXEntry('./vx-1-2.vx', '/hello-recore/src/pages/settings/about/vx-1-2.js');
    expect(isEntry).to.equal(false);
  });
});
