const { resolve } = require('path');
const isCI = require('is-ci');

const startOptions = {
  writeToDisk: {
    type: 'boolean',
    description: '控制是否产出文件',
    default: false,
  },
  distPath: {
    type: 'string',
    description: 'dist path for devserver, defaults to "build"',
    default: 'build',
  },
  port: {
    type: 'number',
    description: '监听 web 服务端口',
    alias: 's',
  },
  host: {
    type: 'string',
    description: '监听 web 服务域',
    default: '0.0.0.0',
  },
  open: {
    type: 'boolean',
    description: '启动后是否打开浏览器',
    default: true,
  },
  define: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: '用户自定义宏变量',
    default: {},
  },
  https: {
    type: 'boolean',
    description: '启动 https 协议',
    default: false,
  },
  useLocalIp: {
    type: 'boolean',
    description: '使用本地 IP',
    default: false,
  },
  debug: {
    type: 'boolean',
    default: false,
    description: '应用调试',
  },
  proxy: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: '请求代理',
  },
  alias: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack alias',
  },
  externals: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack externals',
  },
  mock: {
    type: 'boolean', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    default: true,
    description: 'mock data',
  },
  appName: {
    type: 'string',
    description: 'app main entry name',
  },
  vendors: {
    type: 'boolean',
    default: true,
    description: '三方库公用脚本',
  },
  assetsPath: {
    type: 'string',
    default: '/__assets/',
    description: 'assets path for devserver, defaults to "__assets"',
  },
  extraEntry: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack entry',
  },
  extraRules: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack rules',
  },
  extraPlugins: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack plugins',
  },
  themeEntry: {
    type: 'string',
    description: 'multi-themes directory(多主题入口)',
  },
  usingTheme: {
    type: 'string',
    description: 'selected theme(开发时使用的主题)',
  },
  modules: {
    type: 'boolean',
    default: false,
    description: '多模块模式（多入口）',
  },
  component: {
    type: 'boolean',
    default: false,
    description: '标示当前项目类型为组件，区别于 APP',
  },
  target: {
    type: 'string',
    default: 'web',
    description: '构建目标',
  },
  progress: {
    type: 'boolean',
    default: !isCI,
    description: '显示构建进度进度条',
  },
  lessVars: {
    type: 'string',
    description: '用于注入 less 变量',
    default: {},
  },
  deep: {
    type: 'string',
    default: {
      themePackage: '',
      themeConfig: {},
    },
    description: 'Deep主题样式注入',
  },
};

const buildOptions = {
  alias: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack alias',
  },
  externals: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack externals',
  },
  define: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: '用户自定义宏变量',
    default: {},
  },
  spm: {
    type: 'string',
    description: '埋点配置',
  },
  assetsPath: {
    type: 'string',
  },
  extraEntry: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack entry',
  },
  mock: {
    type: 'boolean', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    default: false,
    description: 'mock data',
  },
  appName: {
    type: 'string',
    description: 'app main entry name',
  },
  vendors: {
    type: 'boolean',
    default: true,
    description: '三方库公用脚本',
  },
  distPath: {
    type: 'string',
    description: 'dist path for devserver, defaults to "build"',
    default: 'build',
  },
  extraRules: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack rules',
  },
  extraPlugins: {
    type: 'string', // 这里实际会被解析成各种形式（字符串、对象、函数），不期望从命令行输入
    description: 'webpack plugins',
  },
  themeEntry: {
    type: 'string',
    description: 'multi-themes directory(多主题入口)',
  },
  modules: {
    type: 'boolean',
    default: false,
    description: '多模块模式(多入口)',
  },
  modulesForOffline: {
    type: 'array',
    description: '多模块模式下用于指定哪些 module 用于小程序离线',
  },
  prerenderForOffline: {
    type: 'boolean',
    default: true,
    description: '是否在小程序离线构建中启用预渲染',
  },
  target: {
    type: 'string',
    default: 'web',
    description: '构建目标',
  },
  o: {
    type: 'boolean',
    description: '构建时线上环境设置(对应的，日常环境为 p)',
  },
  offline: {
    type: 'string',
    description: '构建离线包参数',
  },
  pages: {
    type: 'string',
    description: '预渲染构建 pages 配置',
  },
  progress: {
    type: 'boolean',
    default: !isCI,
    description: '显示构建进度进度条',
  },
  lessVars: {
    type: 'string',
    description: '用于注入 less 变量',
    default: {},
  },
  deep: {
    type: 'string',
    default: {
      themePackage: '',
      themeConfig: {},
    },
    description: 'Deep主题样式注入',
  },
};

module.exports = ({
  nowa: {
    plugins: [
      resolve(__dirname, 'plugins/load-config/index.js'),
      resolve(__dirname, 'plugins/parse-config/index.js'),
    ],
  },
  commands: {
    start: {
      options: startOptions,
      description: '启动服务 & 开发调试',
      actions: [
        () => ['webpack', resolve(__dirname, './webpack/webpack.dev.js')],
      ],
    },
    'build/tpl': {
      options: {},
      description: 'Recore 项目模版化',
      actions: [
        () => ['script', `node ${resolve(__dirname, 'scripts/tpl.build.js')}`],
      ],
    },
    'build/component': {
      options: buildOptions,
      description: '构建组件',
      actions: [
        () => ['script', `node ${resolve(__dirname, 'scripts/component.build.js')}`],
      ],
    },
    build: {
      options: buildOptions,
      description: '构建线上发布版本',
      actions: [
        ({ options }) => {
          // Recore App
          if (options.o) {
            return ['webpack', resolve(__dirname, './webpack/webpack.online.js')];
          }
          // 调试代码
          return ['webpack', resolve(__dirname, './webpack/webpack.online.debug.js')];
        },
      ],
    },
    upgrade: {
      options: {},
      description: '更新项目',
      actions: [
        () => ['script', ['npx @recore/upgrade --ignore-existing']],
      ],
    },
  },
  intro: {
    build: {
      babel: '仅过 babel',
    },
    start: {
      port: '服务端口号',
      https: '启动 https 协议',
      _label: '启动开发服务器',
    },
  },
});
