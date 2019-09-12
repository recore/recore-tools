function requireDefault(path) {
  const obj = require(path); // eslint-disable-line
  return obj && obj.__esModule ? obj.default : obj;
}

const babelPluginImport = requireDefault('babel-plugin-import');

module.exports = {
  babelrc: false,
  presets: [
    [requireDefault('@babel/preset-env'), {
      modules: false,
    }],
    requireDefault('@babel/preset-react'),
  ],
  plugins: [
    requireDefault('@babel/plugin-proposal-export-default-from'),
    [requireDefault('@babel/plugin-proposal-optional-chaining'), {
      loose: true,
    }],

    // Stage 2
    [requireDefault('@babel/plugin-proposal-decorators'), {
      legacy: true,
    }],
    requireDefault('@babel/plugin-proposal-function-sent'),
    requireDefault('@babel/plugin-proposal-export-namespace-from'),
    requireDefault('@babel/plugin-proposal-numeric-separator'),
    requireDefault('@babel/plugin-proposal-throw-expressions'),

    // Stage 3
    requireDefault('@babel/plugin-syntax-dynamic-import'),
    requireDefault('@babel/plugin-syntax-import-meta'),

    requireDefault('@babel/plugin-proposal-object-rest-spread'),
    [requireDefault('@babel/plugin-proposal-class-properties'), {
      loose: true,
    }],
    requireDefault('@babel/plugin-proposal-json-strings'),
    [
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime#why
      // 文中所描述的 @babel/runtime 依赖放在这里控制
      // 在 solution 中通过 resolve.modules 指明引用
      requireDefault('@babel/plugin-transform-runtime'),
      {
        // https://www.babeljs.cn/docs/plugins/transform-runtime#helpers
        helpers: true,
        regenerator: true,
      },
    ],
    [
      babelPluginImport,
      {
        libraryName: 'antd',
        libraryDirectory: 'es', // default: lib
        style: 'css',
      },
      'antd',
    ],
    [
      babelPluginImport,
      {
        libraryName: 'uxcore',
        libraryDirectory: 'lib', // default: lib
        camel2DashComponentName: false,
      },
      'uxcore',
    ],
    [
      babelPluginImport,
      {
        libraryName: 'saltui',
        camel2DashComponentName: false,
      },
      'saltui',
    ],
    [
      babelPluginImport,
      {
        libraryName: '@ali/inner-uxcore',
        libraryDirectory: 'lib',
        camel2DashComponentName: false,
      },
      '@ali/inner-uxcore',
    ],
    [
      babelPluginImport,
      {
        libraryName: '@ali/deep',
        libraryDirectory: 'build/lib',
        style: true,
        camel2DashComponentName: true,
      },
      '@ali/deep',
    ],
    [
      babelPluginImport,
      {
        libraryName: '@alifd/next',
        style: true,
        libraryDirectory: 'es',
      },
      '@alifd/next',
    ],
  ],
  cacheDirectory: true,
  sourceType: 'unambiguous',
};
