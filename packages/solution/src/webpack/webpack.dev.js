const {
  join, resolve,
} = require('path');
const { removeSync } = require('fs-extra');
const merge = require('webpack-merge');
const webpack = require('webpack');
const {
  scan: scanThemes,
  select: selectTheme,
} = require('../lib/theme-utils');
const ThemeDevBuilder = require('../plugins/theme-dev-builder');
const MultiModules = require('../lib/multi-modules');

const BaseCondfig = require('./webpack.base');
const {
  DEFAULT_BOOTSTRAP_PATH,
  isFile,
  createDevtoolModuleFilenameTemplate,
  logger,
  findBootstrap,
  handleRequest,
  addSlash,
  mergeDefine,
} = require('../utils');

const ENV = process.env;

// TODO: 新版 html 生成方案
// const generator = require('../plugins/recore-homepage/generator');

module.exports = async function DevWebpack(args = {}) {
  const ctxPath = args.context || process.cwd();
  const { options } = args;
  const {
    alias,
    externals,
    proxy,
    extraEntry = {},
    mock = true,
    themeEntry,
    usingTheme,
    component,
    modules,
    target,
    distPath,
    writeToDisk, // 控制构建时是否产出文件
    define,
  } = options;

  // 处理 assetsPath 格式
  let assetsPath;
  if (options.assetsPath) {
    assetsPath = addSlash(options.assetsPath);
  }

  // 处理首页代码
  let indexHtmlPath = join(ctxPath, 'index.html');
  if (!isFile(indexHtmlPath)) {
    indexHtmlPath = resolve(__dirname, '../template/index.html');
  }

  // 获取 package 中的配置
  const appPkg = require(join(ctxPath, 'package.json')); // eslint-disable-line

  // 获取基础配置
  options.mode = 'development';
  const baseConfig = await BaseCondfig(options, ctxPath, appPkg);

  const appName = options.appName || appPkg.name.replace(/^(?:@(?:ali|alipay|alife)\/)?(.*)$/, '$1');

  // 处理主题配置
  let themes = [];
  let selectedTheme = `${usingTheme}.theme`;
  if (themeEntry) {
    themes = scanThemes(join(ctxPath, themeEntry));
    if (!selectedTheme) selectedTheme = selectTheme(Object.keys(themes));
  }
  logger.debug('select the theme: ', selectedTheme);

  const entry = {
    ...extraEntry,
    ...themes, // 注入主题文件
  };

  // 实例化多模块（入口）
  const multiModules = new MultiModules({
    resourePath: join(ctxPath, 'src/modules'),
    defaultBootstrapPath: DEFAULT_BOOTSTRAP_PATH,
    defaultIndexHTMLPath: indexHtmlPath,
  });

  if (modules) {
    // 多入口
    await multiModules.scan();
    const { entries } = multiModules;
    Object.keys(entries).forEach((name) => {
      entry[name] = entries[name];
    });
  } else {
    // 构造入口
    const mainEntry = `${findBootstrap(ctxPath)}?${component ? 'boot&component' : 'boot'}`; // 应用的入口
    entry[appName] = mainEntry;
  }

  // 构造输出位置
  const distPath2 = (process.env.BUILD_DEST || distPath).replace(/\\/g, '/');
  const outputPath = resolve(ctxPath, distPath2);
  // 删除之前生成对文件
  removeSync(outputPath);

  // 返回融合之后的配置
  const config = merge(baseConfig, {
    entry,
    output: {
      path: outputPath, // 这个参数会在用户开启 output 选项时生效
      pathinfo: true,
      filename: '[name].js',
      publicPath: assetsPath,
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: createDevtoolModuleFilenameTemplate(appName),
    },
    performance: {
      hints: false,
    },
    target: target || 'web',
    devtool: 'cheap-module-source-map',
    watch: true,
    mode: 'development',
    devServer: {
      // clientLogLevel: argv.debug ? 'error' : 'info',
      writeToDisk,
      contentBase: './',
      watchContentBase: true,
      // publicPath: '/',
      useLocalIp: options.useLocalIp,
      proxy,
      // quiet: !argv.debug,
      https: !!options.https,
      stats: {
        colors: true,
        errors: true,
        timings: true,
        // 添加构建模块信息
        modules: false,
        hash: false,
      },
      inline: true,
      /**
       * 如果跑在无界平台，则固定端口为 8080
       */
      port: ENV.CONTAINER === 'docker' ? 8080 : options.port,
      host: options.host || '0.0.0.0',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      disableHostCheck: true,
      open: options.open,
      before: handleRequest({
        appName,
        entry,
        indexHtmlPath,
        multiModules,
        selectedTheme,
        options, // 这边 options 特指 recore.config.js 中的配置
      }),
    },
    plugins: [
      new webpack.DefinePlugin(mergeDefine(define, {
        'process.env.NODE_ENV': '"development"',
        __MOCK__: mock ? 'true' : 'false',
        __mock__: mock ? 'true' : 'false',
        __DEV__: 'true',
        __RECORE__: '{}',
      })),
      new webpack.NamedModulesPlugin(),
      new ThemeDevBuilder(),
    ],
  }, {
    resolve: { alias },
    externals,
  });

  // 如果是在 docker 中运行，则配置 watchOptions 避免 ENOSPC
  // https://webpack.js.org/configuration/watch#not-enough-watchers
  // https://github.com/webpack/webpack/issues/125#issuecomment-177988207
  if (process.env.CONTAINER === 'docker') {
    config.devServer.watchOptions = {
      ignored: /node_modules/,
      aggregateTimeout: 800,
      poll: 1500,
    };
  }

  return config;
};
