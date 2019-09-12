const { stat, statSync } = require('fs');
const { basename, dirname, join } = require('path');


const prototypeHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
  return obj && prototypeHasOwnProperty.call(obj, key);
}

function pStat(filePath) {
  return new Promise((resolve, reject) => {
    stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stats);
    });
  });
}

function isFile(_paths) {
  try {
    const stats = statSync(_paths);
    if (stats.isFile()) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

/**
 * 判断是否是视图(VX)入口文件
 * @param {string} target 待判定的路径
 * @param {string} base? 被探测的基础路径，用于确定父级目录名
 * @return {boolean}
 */
function judgeIsVXEntry(target, base = '') {
  let dirName;
  if (base) {
    if (base.endsWith('.vx')) {
      dirName = basename(dirname(base));
    } else {
      dirName = basename(base);
    }
  } else {
    dirName = basename(dirname(target));
  }

  const name = basename(target);
  return name === 'index.vx' // index.vx
    || name === `${dirName}.vx` // 文件和目录名相同
    || name === 'app.vx'; // 这个是特殊入口，一般存在 src 下
}

function normalizeRouteMain(baseDir, itemMain) {
  // 下面变量 a 对应的格式是直接字母开头
  // 因为 baseDir 是 ./ 的形式的时候经过 join 处理之后会被去掉
  const a = join(baseDir, itemMain);

  // 所以这的时候，只要判断是不是 ../ 和 / 开头的情况即可
  if (!/^(?:\.\.\/|\/)/.test(a)) {
    // 检查是否是以 ../ 或者 / 开头
    // 如果不是，需要增加 ./
    return `./${a}`;
  }

  return a;
}

module.exports = {
  hasOwnProperty,
  pStat,
  isFile,
  judgeIsVXEntry,
  normalizeRouteMain,
};
