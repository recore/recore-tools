/**
 * 处理主题相关的逻辑
 */
const fs = require('fs');
const Path = require('path');

const { readdirSync } = fs;
const { basename, join } = Path;

/**
 * 扫描主题文件夹
 * 获取主题列表
 * @param {String} entry themes 目录路径
 * @return {Array<String>}
 */
function scan(entry) {
  // 匹配 .theme.css 或者 .theme.less
  const reg = /\.theme\.(?:le|c)ss$/;
  const result = {};

  readdirSync(entry)
    .filter(file => reg.test(file))
    .forEach((file) => {
      const name = basename(file);
      const key = name.replace(/\.(less|css)$/, '');

      result[key] = join(entry, file);
    });

  return result;
}

/**
 * 选择某个主题
 * @param {Array<String>} themes 主题列表
 * @returns {String|null}
 */
function select(themes) {
  if (!themes || typeof themes.sort !== 'function') {
    return null;
  }
  const sorted = themes.sort();
  return sorted[0];
}

module.exports = {
  scan,
  select,
};
