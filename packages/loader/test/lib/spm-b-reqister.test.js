const axios = require('axios');
const { expect } = require('chai');
const sinon = require('sinon');
const SpmBRegister = require('../../src/lib/spm-b-register');

describe('test #SpmBRegister', () => {
  it('#register', async () => {
    const register = new SpmBRegister({ spmA: 'a1z3n8', domain: 'recore-1.alibaba-inc.com' });
    const data = await register.run('loader-test', '/hello-recore/test/1');
    expect(data).to.eql({
      '//recore-1.alibaba-inc.com/hello-recore/test/1': '12059113',
    });
  });

  it('#register without pageName', async () => {
    const mocker = sinon.stub(axios, 'get').callsFake(async () => ({
      data: {
        code: 1,
        data: {
          spmb: 'xx11',
        },
      },
    }));
    const register = new SpmBRegister({ spmA: 'a1z3n8', domain: 'recore-1.alibaba-inc.com' });
    const data = await register.run(undefined, '/hello-recore/test/1');
    const { pageName } = mocker.args[0][1].params;
    expect(pageName).to.eql('/hello-recore/test/1');
    expect(data).to.eql({
      '//recore-1.alibaba-inc.com/hello-recore/test/1': 'xx11',
    });

    axios.get.restore();
    mocker.resetBehavior();
  });
});
