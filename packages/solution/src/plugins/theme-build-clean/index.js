/**
 * 统一处理 recore 产出的样式文件
 * - 删除多余的主题文件 xx.theme.js
 * - 多余的 xx.theme.js.map 通过配置 SourceMapDevToolPlugin: exclude 过滤掉
 */

const THEME_REGEXP = /\.theme(\.min)?\.js$/;

class ThemeBuildCleanPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ThemeBuildCleanPlugin',
      (compilation) => {
        compilation.hooks.additionalChunkAssets.tap('ThemeBuildCleanPlugin', (chunks) => {
          if (!chunks) return;

          // 过滤掉主题 JS 文件的 chunk
          for (let i = 0, max = chunks.length; i < max; i++) { /* eslint-disable-line */
            const chunk = chunks[i];
            const { files } = chunk;

            chunks[i].files = files.filter(name => !THEME_REGEXP.test(name));
          }
        });

        compilation.hooks.additionalAssets.tapAsync('ThemeBuildCleanPlugin', (callback) => {
          const { assets } = compilation;
          const newAssets = {};

          // 过滤掉主题 JS 文件
          Object.keys(assets)
            .filter(name => !THEME_REGEXP.test(name))
            .forEach((name) => { newAssets[name] = assets[name]; });
          compilation.assets = newAssets;
          callback();
        });
      });
  }
}

module.exports = ThemeBuildCleanPlugin;
