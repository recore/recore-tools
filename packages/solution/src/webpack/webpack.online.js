const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { resolve, join } = require('path');
const { removeSync } = require('fs-extra');

const BaseCondfig = require('./webpack.base');
const UXCoreAnalysis = require('../lib/uxcore-analysis');
const MultiModules = require('../lib/multi-modules');

// const RecoreHomepagePlugin = require('../plugins/recore-homepage');
const ModuleScopePlugin = require('../plugins/module-scope');
const ThemeBuildCleanPlugin = require('../plugins/theme-build-clean');
const {
  DEFAULT_BOOTSTRAP_PATH,
  extensions,
  logger,
  findBootstrap,
  addSlash,
  mergeDefine,
} = require('../utils');
const {
  scan: scanThemes,
} = require('../lib/theme-utils');


const PROJECT_PATH = process.env.BUILD_WORK_DIR || process.cwd();
logger.debug('PROJECT_PATH: ', PROJECT_PATH);

const uxcoreAnalysis = new UXCoreAnalysis(PROJECT_PATH);


module.exports = async function WebpackOnline(args = {}) {
  const ctxPath = process.env.BUILD_WORK_DIR || args.context || process.cwd();
  const options = args.options || {};
  const {
    alias,
    externals,
    spm,
    extraEntry = {},
    themeEntry,
    modules,
    target,
    define,
  } = options;

  // 处理 assetsPath 格式
  let assetsPath;
  if (options.assetsPath) {
    assetsPath = addSlash(options.assetsPath);
  }

  // 获取 package.json 内容
  const appPkg = require(join(ctxPath, 'package.json')); // eslint-disable-line

  // 获取 webpack 基础配置
  options.mode = 'production';
  const baseConfig = await BaseCondfig(options, ctxPath, appPkg);

  // 设置导出的文件名
  const appName = options.appName || 'app';
  const distPath = (process.env.BUILD_DEST || options.distPath || 'build').replace(/\\/g, '/');

  // 多主题（入口）处理
  let themes = {};
  if (themeEntry) {
    themes = scanThemes(join(ctxPath, themeEntry));
  }

  // 埋点处理：构造必要对启动参数
  let bootQueryString = '?boot';
  if (spm) {
    const { A, domain } = spm;
    if (A && domain) {
      bootQueryString = `?boot&spmA=${spm.A}&domain=${spm.domain}`;
    } else {
      logger.error('Please set spm::A and spm::domain at the same time.');
    }
  }

  // 构造入口
  const entry = {
    ...extraEntry,
    ...themes, // 注入主题文件
  };

  // 多模块(入口)处理
  const multiModules = new MultiModules({
    resourePath: join(ctxPath, 'src/modules'),
    defaultBootstrapPath: DEFAULT_BOOTSTRAP_PATH,
  });
  if (modules) {
    // 多模块(入口)
    await multiModules.scan();
    const { entries } = multiModules;
    Object.keys(entries).forEach((name) => {
      // 消掉 ?boot，在 MultiModules 模块中已经处理
      entry[name] = entries[name] + bootQueryString.replace(/^\?boot/, '');
    });
  } else {
    // 构造入口
    const mainEntry = `${findBootstrap(ctxPath)}${bootQueryString}`; // 应用的入口
    entry[appName] = mainEntry;
  }

  // 构造输出位置(删除之前生成对文件)
  const outputPath = resolve(ctxPath, distPath);
  removeSync(outputPath);

  const config = merge(baseConfig, {
    entry,
    output: {
      path: outputPath,
      filename: '[name].min.js',
      chunkFilename: '[name].min.js',
      publicPath: assetsPath,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.min\.js$/,
          sourceMap: false,
          parallel: 4,
        }),
        new OptimizeCssAssetsPlugin({
          assetNameRegExp: /\.min\.css$/,
          cssProcessorPluginOptions: {
            preset: ['default', {
              discardComments: { removeAll: true },
              mergeLonghand: false,
            }],
          },
          canPrint: true,
        }),
      ],
    },
    mode: 'production',
    target: target || 'web',
    devtool: false, // 'source-map',
    bail: true, // Don't attempt to continue if there are any errors.
    resolve: {
      modules: ['node_modules'],
      extensions: extensions(),
      plugins: [
        new ModuleScopePlugin(join(ctxPath, 'src'), [join(ctxPath, 'package.json')]),
      ],
    },
    plugins: [
      new webpack.DefinePlugin(mergeDefine(define, {
        'process.env.NODE_ENV': '"production"',
        __MOCK__: 'false',
        __mock__: 'false',
        __DEV__: 'false',
        __RECORE__: JSON.stringify({
          lib: uxcoreAnalysis.run('sync'),
        }),
      })),

      new MiniCssExtractPlugin({
        filename: '[name].min.css',
      }),

      // 加载主题构建清洁器
      new ThemeBuildCleanPlugin(),
    ],
  }, {
    resolve: { alias },
    externals,
  });

  return config;
};
