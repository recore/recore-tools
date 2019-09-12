const { parseQuery } = require('loader-utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const babelOptions = require('../config/babel-config');

const RECORE_BABEL_LOADER = {
  loader: require.resolve('babel-loader'),
  options: babelOptions,
};

const RECORE_TYPESCRIPT_LOADER = {
  loader: require.resolve('awesome-typescript-loader'),
  options: {
    ignoreDiagnostics: [2708],
    useTranspileModule: true,
  },
};

function getRecoreAPILoader(mode) {
  return {
    loader: '@ali/api-loader',
    // TODO: replace NODE_ENV by mode
    options: { mock: mode === 'development' },
  };
}

function createLoaderConfig(indicator, typescript = false) {
  const use = (data) => {
    const { resourceQuery = '' } = data || {};
    const loaders = [
      RECORE_BABEL_LOADER,
      {
        loader: '@recore/recore-loader',
        options: parseQuery(resourceQuery),
      },
    ];
    if (typescript) {
      loaders.push(RECORE_TYPESCRIPT_LOADER);
    }
    return loaders;
  };

  return {
    resourceQuery: new RegExp(indicator),
    use,
  };
}

function getStyleLoader(mode, preProcessor, deep = {}) {
  const loaders = mode === 'production'
    ? [
      MiniCssExtractPlugin.loader,
      require.resolve('css-loader'),
    ]
    : [
      require.resolve('style-loader'),
      require.resolve('css-loader'),
    ];
  if (preProcessor) {
    if (preProcessor === 'sass-loader') {
      /*
      const scss = [];
      Object.keys(deep.themeConfig).forEach((key) => {
        scss.push(`$${key}: ${deep.themeConfig[key]}`);
      });
      loaders.push({
        loader: preProcessor,
        options: {
          data: `${scss.join(';')};`,
        },
      });
      loaders.push({
        loader: '@alifd/next-theme-loader',
        options: {
          theme: deep.themePackage,
        },
      });*/
    } else {
      loaders.push(preProcessor);
    }
  }

  return loaders;
}

const JS_USING_LOADER = [
  createLoaderConfig('router'),
  createLoaderConfig('boot'),
  {
    use: [
      RECORE_BABEL_LOADER,
    ],
  },
];

module.exports = {
  getStyleLoader,
  getRecoreAPILoader,
  createLoaderConfig,
  RECORE_BABEL_LOADER,
  RECORE_TYPESCRIPT_LOADER,
  JS_USING_LOADER,
};
