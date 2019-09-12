const { resolve } = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const {
  extensions,
  externals,
  loaders,
  getVendorsName,
} = require('../utils');

const solutionPath = resolve(__dirname, '..', '..');

module.exports = async function BaseWebpack(
  argv,
  ctxPath,
  // appPkg
) {
  const baseConfig = {
    resolveLoader: {
      modules: [
        resolve(ctxPath, 'node_modules'),
        resolve(solutionPath, 'node_modules'),
      ],
    },

    resolve: {
      modules: [
        'node_modules',
        ctxPath,
        resolve(ctxPath, 'node_modules'),
      ],
      extensions: extensions(),
      plugins: [
        new TsconfigPathsPlugin({
          configFile: resolve(ctxPath, './tsconfig.json'),
          extensions: extensions(),
          silent: true,
        }),
      ],
    },

    externals: externals(),

    plugins: [
      argv.progress && new webpack.ProgressPlugin(),
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom',
      }),
    ].filter(Boolean),
    node: {
      process: false,
      fs: false,
      net: false,
      child_process: false,
    },
    profile: true,
    context: ctxPath,
    module: {
      // makes missing exports an error instead of warning
      strictExportPresence: true,
      rules: loaders(argv, ctxPath),
    },
  };

  const vendorsName = getVendorsName(argv.vendors);
  if (vendorsName) {
    baseConfig.optimization = {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/].*js$/,
            name: vendorsName,
            chunks: 'all',
          },
        },
      },
    };
  }

  return baseConfig;
};
