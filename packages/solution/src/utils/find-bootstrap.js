/**
 * 查找 Bootstrap
 */

const { resolve } = require('path');
const { accessSync } = require('fs');

const DEFAULT_BOOTSTRAP_NAME = 'bootstrap';
const DEFAULT_BOOTSTRAP_PATH = resolve(__dirname, '../template/bootstrap.ts');

function checkSync(path) {
  try {
    accessSync(path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
  return true;
}

function findBootstrap(projectPath) {
  const path1 = resolve(projectPath, `src/${DEFAULT_BOOTSTRAP_NAME}.js`);

  if (checkSync(path1)) {
    return path1;
  }

  const path2 = resolve(projectPath, `src/${DEFAULT_BOOTSTRAP_NAME}.ts`);
  if (checkSync(path2)) {
    return path2;
  }

  return DEFAULT_BOOTSTRAP_PATH;
}

module.exports = findBootstrap;
module.exports.DEFAULT_BOOTSTRAP_PATH = DEFAULT_BOOTSTRAP_PATH;
