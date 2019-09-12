const { resolve } = require('path');
const { expect } = require('chai');
const { runLoaders } = require('loader-runner');

function runRoutesLoader(entryFilePath, cb) {
  runLoaders({
    resource: entryFilePath,
    loaders: [{
      loader: require.resolve('../../src/transform/routes'),
      options: {},
    }],
  }, cb);
}


describe('router transform ...', () => {
  it('transform test.0.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.0.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('routesConfig');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      done();
    });
  });

  it('transform test.1.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.1.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('routesConfig');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      done();
    });
  });

  it('transform test.2.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.2.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('routesConfig');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      done();
    });
  });

  it('transform test.3.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.3.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('routesConfig');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      done();
    });
  });

  it('transform test.4.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.4.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(err);
      const newSource = result[0];
      expect(newSource).to.include('routesConfig');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      done();
    });
  });

  it('transform test.5.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.5.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(err);
      const newSource = result[0];
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      expect(newSource).to.include('import RRAbout0 from "./pages/about/index.vx');
      expect(newSource).to.include('/* webpackChunkName: "home" */');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      done();
    });
  });

  it('transform test.7.routes.js', (done) => {
    const entryFilePath = resolve(__dirname, 'source/routes/test.7.routes.js');
    runRoutesLoader(entryFilePath, (err, { result }) => {
      expect(err).to.equal(err);
      const newSource = result[0];
      expect(newSource).to.include('import { createRouter, createDynamicLoader } from \'@ali/recore\'');
      expect(newSource).to.include('import RRPagesIAmTsx0 from "./pages/i-am-tsx.tsx"');
      expect(newSource).to.include('export default createRouter(routesConfig, pagesMap)');
      done();
    });
  });
});
