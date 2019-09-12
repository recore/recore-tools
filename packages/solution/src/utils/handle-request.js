const { readFileSync } = require('fs');
const {
  extname,
} = require('path');

const ShouldProxy = require('../lib/should-proxy');
const processHTML = require('./process-html');

module.exports = ({
  appName, entry, indexHtmlPath, multiModules, selectedTheme, options,
}) => {
  const {
    modules, proxy,
  } = options;
  // 判断是否需要代理的类
  const shouldProxy = new ShouldProxy(proxy);

  return (app) => {
    app.get('*', (req, res, next) => {
      // TODO: 这个区块代码需要后面找时间优化
      // 目前，这部分代码融合了
      // - 代理请求处理
      // - SPA 模式对不同配置、资源的控制和注入
      //   - 多主题
      //   - 多模块(入口)

      // 代理请求处理逻辑
      if (shouldProxy.should(req)) {
        next();
        return;
      }

      // TODO: 新版 html 生成方案
      // 目前先注释，方案还未确定
      // const contents = generator(indexHtmlPath, {
      //   recorejs: '/node_modules/@ali/recore/build/recore.umd.js',
      //   appjs: '/__assets/main.js',
      // });
      const extensionName = extname(req.path);

      // 无后缀处理逻辑(SPA)或者是 html 文件
      // 加载主题文件，加载必要 JS 文件
      if (extensionName === '' || extensionName === '.html') {
        // 原始内容处理
        // 分多模块和单模块模式
        let content = modules
          ? multiModules.access(req.url)
          : readFileSync(indexHtmlPath, 'utf8');

        content = processHTML({
          content, appName, entry, multiModules, selectedTheme, options,
        });

        res.end(content);
        return;
      }

      // 其他情况
      next();
    });
  };
};
