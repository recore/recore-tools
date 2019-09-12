/**
 * 在开发阶段，根据生成出来的 theme.js 做 CSS 提取处理
 * 额外输出 .theme.css 用作代理使用
 */
const ThemeAsset = require('./theme-asset');

const THEME_REGEXP = /\.theme\.js$/;

class ThemeDevBuilder {
  apply(compiler) {
    compiler.hooks.compilation.tap('ThemeDevBuilder',
      (compilation) => {
        compilation.hooks.additionalAssets.tapAsync('ThemeDevBuilder', (callback) => {
          const { assets } = compilation;

          Object.keys(assets)
            .filter(name => THEME_REGEXP.test(name))
            .forEach((name) => {
              const asset = new ThemeAsset(assets[name].source());
              assets[name.replace(/\.js$/, '.css')] = asset;
            });

          callback();
        });
      });
  }
}

module.exports = ThemeDevBuilder;
