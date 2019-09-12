const { resolve } = require('path');
const { runLoaders } = require('loader-runner'); // eslint-disable-line
const { expect } = require('chai'); // eslint-disable-line

const sinon = require('sinon'); // eslint-disable-line
const findAppEntry = require('../../src/transform/bootstrap/find-app-entry');

const MAIN_PATH = './app.vx';
const mockFindAppEntry = sinon.spy(findAppEntry);

function runBootstrapLoader(entryFilePath, cb, options) {
  const { file, spm, m } = options || {};
  runLoaders({
    resource: entryFilePath,
    loaders: [{
      loader: require.resolve('../../src/transform/bootstrap'),
      options: {
        file: file || MAIN_PATH,
        spm: JSON.stringify(spm),
        m,
      },
    }],
  }, cb);
}

describe('test bootstrap transform', () => {
  it('#typescript', (done) => {
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(__dirname));

    runBootstrapLoader(resolve(__dirname, './src/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource.split('\n')[0]).to.includes('import "@ali/nowa-recore-solution/src/recore-public-path";');
      expect(newSource.split('\n')[1]).to.include('import \'@babel/polyfill\';');
      expect(newSource.split('\n')[2]).to.include('import { runApp } from \'@ali/recore\'');
      expect(newSource.split('\n')[3]).to.include(`import App from "${MAIN_PATH}?main&basename=%2F"`);
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    }, {
      file: null,
      spm: {
        A: 'abc123',
        domain: 'alibaba-inc.com',
      },
    });
  });

  it('#return absolute path', (done) => {
    const projectPath = resolve(__dirname, './nowa-recore-solution');
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(projectPath));

    runBootstrapLoader(resolve(projectPath, './src/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource).to.include(`import App from "${resolve(projectPath, './src/app.vx')}?main&basename=%2F"`);
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    });
  });

  it('#take the package.json::main as the app entry', (done) => {
    const projectPath = resolve(__dirname, './config-package-main-demo');
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(projectPath));

    runBootstrapLoader(resolve(projectPath, './src/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource).to.include('import App from "./../app.vx?main&basename=%2F"');
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    });
  });

  it('#use the router as the app entry', (done) => {
    const projectPath = resolve(__dirname, './router-as-the-entry-demo');
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(projectPath));

    runBootstrapLoader(resolve(projectPath, './src/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource).to.include('import App from "./router.ts?router&asEntry&basename=%2F"');
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    });
  });

  it('#handle the module boot correctly', (done) => {
    const projectPath = resolve(__dirname, './multi-modules-demo');
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(projectPath));

    runBootstrapLoader(resolve(projectPath, './src/modules/admin/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource).to.include('import App from "./app.vx?main&basename=%2F"');
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    }, {
      m: 'admin',
    });
  });

  it('#handle the module boot correctly with src/bootstrap', (done) => {
    const projectPath = resolve(__dirname, './multi-modules-demo');
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(projectPath));

    runBootstrapLoader(resolve(projectPath, './src/bootstrap.ts'), (err, { result }) => {
      expect(err).to.equal(null);
      expect(mockFindAppEntry.called);
      const newSource = result[0];
      expect(newSource).to.include('import App from "./modules/admin/app.vx?main&basename=%2F"');
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    }, {
      m: 'admin',
    });
  });

  it('#commonjs', (done) => {
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(__dirname));

    runBootstrapLoader(resolve(__dirname, './src/bootstrap.commonjs.js'), (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include(`import App from "${MAIN_PATH}?main&basename=%2F"`);
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    });
  });

  it('#es6Module', (done) => {
    const stub = sinon.stub(process, 'cwd').callsFake(() => resolve(__dirname));

    runBootstrapLoader(resolve(__dirname, './src/bootstrap.es6.js'), (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include(`import App from "${MAIN_PATH}?main&basename=%2F"`);
      expect(newSource).to.include('(App,');
      stub.restore();
      done();
    }, {
      file: null,
      spm: {
        A: 'abc123',
        domain: 'alibaba-inc.com',
      },
    });
  });
  // it('#require', (done) => {
  //   runRoutesLoader(resolve(__dirname, './source/bootstrap.require.js'), (err, { result }) => {
  //     expect(err).to.equal(null);
  //     const newSource = result[0];
  //     expect(newSource).to.include(`import App from "!@ali/recore-loader?main!${MAIN_PATH}"`);
  //     expect(newSource).to.include('(App,');
  //     done();
  //   });
  // });
});
