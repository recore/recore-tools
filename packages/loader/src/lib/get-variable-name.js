const { basename, dirname } = require('path');

let indexNum = 0;

function camelCase(str) {
  return str.replace(/^(.)|[-_.](.)/g, (_, a1, a2) => (a1 || a2).toUpperCase());
}
/*
 * 获取变量名 App
 * 生成 import App from './app'
 * 如果是 index.xx router.js router.ts =>文件夹名
 * 如果是具体文件，比如 xxx.tsx => 文件夹名+xxx
 * 如果是数字开头或者其他情况 => V(number)
 */
const getVariableName = (entryPath) => {
  if (!entryPath) {
    return `V${indexNum++}`; /* eslint-disable-line */
  }

  let dirName = basename(dirname(entryPath));
  if (dirName === '.') {
    dirName = `V${indexNum++}`; /* eslint-disable-line */
  }

  let str = basename(entryPath);
  if (str.startsWith('index')
    || str.endsWith('router.js')
    || str.endsWith('router.ts')) {
    str = dirName; // 取目录名
  } else {
    const [name1] = str.split('.');
    str = `${dirName}_${name1}`; // 其他情况，加上目录名，并去掉后缀
  }

  if (!str) {
    return `V${indexNum++}`; /* eslint-disable-line */
  }
  str = camelCase(str.trim());
  if (/^\d/.test(str)) {
    return `V${str}`;
  }
  return str;
};

module.exports = getVariableName;
