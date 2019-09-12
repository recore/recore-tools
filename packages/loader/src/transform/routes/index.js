/**
 * fork from http://gitlab.alibaba-inc.com/recore/routes-loader
 */

const Module = require('module');
const { rollup } = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const { getOptions } = require('loader-utils');
const { isAbsolute } = require('path');
const babel = require('rollup-plugin-babel');
const logger = require('../../lib/logger');
const Codes = require('./codes');
const babelConfig = require('./babel-config');


function exec(code, filename) {
  const module = new Module(filename, this);
  module.paths = Module._nodeModulePaths(this.context);
  module.filename = filename;
  module._compile(code, filename);
  return module.exports;
}

function interopRequireDefault(obj) { return obj && obj.__esModule ? obj.default : obj; }

module.exports = function processChunk() {
  this.cacheable();
  const callback = this.async();
  const { resourcePath } = this;

  rollup({
    input: resourcePath,
    external: id => (id[0] !== '.' && !isAbsolute(id)) || id.slice(-5, id.length) === '.json',
    plugins: [
      resolve({
        extensions: ['.mjs', '.js', '.ts', '.json', '.node'],
      }),
      babel(babelConfig),
    ],
  }).then(bundle => bundle.generate({
    format: 'cjs',
  })).then((res) => {
    Object.keys(res.modules).forEach((item) => {
      this.addDependency(item);
    });

    const routesConfig = interopRequireDefault(exec.call(this, res.code, resourcePath));
    const options = getOptions(this);

    const codes = new Codes(
      routesConfig,
      resourcePath,
      this.addDependency.bind(this),
      options,
    );
    return codes.toCodes().then((code) => {
      callback(null, code);
    });
  }).catch((err) => {
    logger.error(err);
    callback(err);
  });
};
