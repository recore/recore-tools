const { join } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackOnlineConfig = require('./webpack.online');
const {
  logger,
  createDevtoolModuleFilenameTemplate,
} = require('./../utils');

const PROJECT_PATH = process.env.BUILD_WORK_DIR || process.cwd();
logger.debug('PROJECT_PATH: ', PROJECT_PATH);

module.exports = async function WebpackOnline(args = {}) {
  const { options } = args;

  const ctxPath = process.env.BUILD_WORK_DIR || args.context || process.cwd();

  // 获取 webpack 基础配置
  const onlineConfig = await webpackOnlineConfig(args);

  // 获取 package.json 内容
  const appPkg = require(join(ctxPath, 'package.json')); // eslint-disable-line
  const appName = options.appName || appPkg.name.replace(/^(?:@(?:ali|alipay|alife)\/)?(.*)$/, '$1');

  const finalConfig = merge(onlineConfig, {
    optimization: {
      minimize: false,
      namedModules: true,
      namedChunks: true,
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        test: /\.js$/i,
        exclude: /node_modules/,
        filename: '[file].map',
        moduleFilenameTemplate: createDevtoolModuleFilenameTemplate(appName),
        append: null,
        module: true,
        columns: true,
        noSources: false,
      }),
    ],
  });

  return finalConfig;
};
