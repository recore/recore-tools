const { expect } = require('chai');
const sinon = require('sinon');
const { boot: sharedBoot } = require('../../src/transform/share');
const RegisterHelper = require('../../src/transform/routes/register-helper');

describe('test #RegisterHelper', () => {
  let stub;

  before(() => {
    stub = sinon.stub(sharedBoot, 'read').callsFake(() => ({
      spmA: 'a1z3n8',
      domain: 'recore-1.alibaba-inc.com',
    }));
  });

  afterEach(() => {
    stub.reset();
  });

  after(() => {
    sharedBoot.read.restore();
    stub.restore();
  });

  it('#register successfully', async () => {
    const helper = new RegisterHelper();
    const routes = [
      {
        main: './settings',
        path: '/settings',
        spmB: true,
      },
      {
        main: './settings/about',
        path: '/about',
        spmB: true,
      },
      {
        main: './settings/profile',
        path: '/about',
        spmB: 'whatever',
      },
    ];

    const result = await helper.run(routes);

    expect(stub.callCount).to.equal(1);
    expect(result).to.eql([
      {
        main: './settings',
        path: '/settings',
        spmB: '12061525',
      },
      {
        main: './settings/about',
        path: '/about',
        spmB: '12063474',
      },
      {
        main: './settings/profile',
        path: '/about',
        spmB: 'whatever',
      },
    ]);
  });

  it('#no-register redirect', async () => {
    const helper = new RegisterHelper();
    const routes = [
      {
        path: '/settings',
        redirect: './settings',
      },
    ];

    const result = await helper.run(routes);

    expect(stub.callCount).to.equal(1);
    expect(result).to.eql([
      {
        path: '/settings',
        redirect: './settings',
      },
    ]);
  });
});
