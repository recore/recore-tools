const { statSync, readdirSync } = require('fs');
const logger = require('./log')();

const isDir = (_paths) => {
  try {
    const stat = statSync(_paths);
    if (stat.isDirectory()) return true;
  } catch (err) {
    logger.debug('detect "', _paths, '" is not a folder', 'ERR: ', err);
    return false;
  }
  return false;
};

const isFile = (_paths) => {
  try {
    const stat = statSync(_paths);
    if (stat.isFile()) {
      return true;
    }
  } catch (err) {
    logger.debug('detect "', _paths, '" is not a file。', 'ERR: ', err);
    return false;
  }
  return false;
};

const isEmptyDir = (_paths) => {
  if (!isDir(_paths)) {
    return true;
  }
  return !readdirSync(_paths).length;
};

function addSlash(path = '/') {
  if (path === '' || path === '/') {
    return '/';
  }
  if (path[0] !== '/') {
    path = `/${path}`;
  }
  if (path.slice(-1) !== '/') {
    path = `${path}/`;
  }
  return path;
}

module.exports = {
  isDir,
  isFile,
  isEmptyDir,
  addSlash,
};
