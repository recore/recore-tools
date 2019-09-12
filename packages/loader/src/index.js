const { getOptions } = require('loader-utils');
const generate = require('./transform/vx/generate');

const routerTransform = require('./transform/routes');
const bootstrapTransform = require('./transform/bootstrap');

/**
 * Webpack loader see:
 * https://webpack.js.org/contribute/writing-a-loader/
 */
function processChunk(source) {
  const options = getOptions(this);

  const { router, boot } = options || {};

  // 处理路由代码
  if (router) {
    return routerTransform.call(this, source);
  }

  // 处理入口(bootstrap)代码
  if (boot) {
    return bootstrapTransform.call(this, source);
  }

  // 处理其他 vx 代码
  return generate.call(this, source);
}

module.exports = processChunk;
