const {
  basename,
} = require('path');
const getVendorsName = require('./get-vendors-name');


module.exports = ({
  content, entry, selectedTheme, options, multiModules, appName,
}) => {
  const {
    assetsPath, modules, vendors,
  } = options;
  const entryNames = Object.keys(entry);
  if (vendors) {
    entryNames.unshift(getVendorsName(vendors));
  }
  const scripts = entryNames
  // 保留非主题文件，或者保留配置的主题文件
    .filter(name => !name.includes('.theme') || name === selectedTheme)
  // 对于多入口模式，需要过滤出正确的模块 js 文件
    .filter((name) => {
      // 没有开启多入口，直接跳过，不走这边逻辑
      if (!modules) { return true; }

      const moduleName = basename(name);
      const m = multiModules.find(moduleName);

      // 如果没有找到，说明不是模块文件，返回 true
      if (!m) return true;

      // 如果找到该模块，需要确定当前的路由是不是就是该模块
      return multiModules.activeModule && multiModules.activeModule.name === moduleName;
    })
  // 构造 script 链接
  // 使用 proxyPrefix 替换
    .map(name => `<script src="${assetsPath}${name}.js"></script>`).join('\n');

  content = content
  // 增加默认参数 routerBaseName，兼容之前 bootstrap 中 basename 没有配置的情况
    .replace(/<\/head>/, `<script>
  if (!window.g_config) window.g_config = {};
  if (!window.g_config.routerBaseName) window.g_config.routerBaseName = '/';
  </script></head>`)
    .replace(/<\/body>/, `${scripts}</body>`)
    .replace('{title}', appName || 'Recore Project');
  return content;
};
