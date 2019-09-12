const { join } = require('path');
const {
  createLoaderConfig,
  getStyleLoader,
  RECORE_BABEL_LOADER,
  RECORE_TYPESCRIPT_LOADER,
  JS_USING_LOADER,
} = require('./loader-helper');

const cssRegex = /\.css$/;
const lessRegex = /\.less$/;
const sassRegex = /\.scss$/;

module.exports = function Loaders(argv) {
  const {
    mode = 'production', assetsPath, lessVars, deep,
  } = argv;

  const staticLoader = mode === 'development'
    ? {
      loader: require.resolve('url-loader'),
      options: {
        limit: 8192,
        name: '[name].[ext]',
        outputPath: 'static/',
        publicPath: join(assetsPath, 'static'),
        fallback: require.resolve('file-loader'),
      },
    } : {
      loader: require.resolve('file-loader'),
      options: {
        name: '[name].[ext]',
        outputPath: 'static/',
      },
    };

  const loaders = [
    {
      test: /\.vs?x$/,
      oneOf: [
        createLoaderConfig('main'),
        createLoaderConfig('entry'),
        // 输入 vx 文件，仅编译 controller
        createLoaderConfig('compile-ctrl'),
        {
          use: [
            RECORE_BABEL_LOADER,
            '@recore/recore-loader', // 这里没有使用 require.resolve，是为了使用项目中安装对版本
          ],
        },
      ],
    },
    {
      test: /\.js$/,
      exclude: process.env.NODE_ENV === 'development'
        ? /node_modules/
        : /@babel\/|babel-|core-js|uxcore|saltui/,
      oneOf: JS_USING_LOADER,
    },
    {
      test: /\.jsx$/,
      oneOf: JS_USING_LOADER,
    },
    {
      test: /\.tsx?$/,
      oneOf: [
        createLoaderConfig('router', true),
        createLoaderConfig('boot', true),
        {
          use: [
            RECORE_BABEL_LOADER,
            RECORE_TYPESCRIPT_LOADER,
          ],
        },
      ],
    },
    /*
    {
      test: /(\.api|\.type|xux-types(?:.+))\.ts$/,
      use: [
        getRecoreAPILoader(mode),
      ],
    },*/
    {
      test: /\.(png|jpg|jpeg|webp|gif|ttf|eot|woff)(\?.*)?$/i,
      use: [staticLoader],
    },
    {
      test: /\.svg(\?.*)?$/i,
      issuer: {
        test: /\.(less|css|sass|styl)$/,
      },
      use: [staticLoader],
    },
    {
      test: /\.svg(\?.*)?$/,
      issuer: {
        test: /\.[tj]sx?$/,
      },
      use: [
        RECORE_BABEL_LOADER,
        {
          loader: require.resolve('@svgr/webpack'),
          options: { babel: false, icon: true },
        },
      ],
    },
    {
      test: cssRegex,
      use: getStyleLoader(mode),
    },
    {
      test: lessRegex,
      use: getStyleLoader(mode, {
        loader: 'less-loader',
        options: {
          modifyVars: typeof lessVars === 'object' ? lessVars : {},
        },
      }),
    },
    /*
    {
      test: sassRegex,
      use: getStyleLoader(mode, 'sass-loader', deep),
    },*/
  ];
  return loaders;
};
