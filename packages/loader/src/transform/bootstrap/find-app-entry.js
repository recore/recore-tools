/**
 * 查找主页入口
 */

const { resolve, relative, dirname } = require('path');
const { getOptions } = require('loader-utils');
const {
  BOOT_TYPE, analyzeBootType, existsSync, isDefaultBoot,
} = require('./utils');

const ENTRY_NOT_FOUND_ERROR = new Error('[RECORE LOADER] ERROR: Cannot find the entry of the app. Are you sure set it correctly?');
const DEFAULT_ENTRY_NAME = 'app';
const MULTI_MODULES_DIR_NAME = 'modules';

/**
 * 查找 app.vx 文件
 * 这边需要处理 3 种情况
 * 组件: 目前约定 src/index.vx 为入口，其他情况不给予考虑
 * 单入口: package.json::main, src/app.vx
 * 多入口: module/xx/app.vx, src/app.vx
 * @param {object} loaderInst
 */
function findAppEntry(loaderInst) {
  // 这边写在函数内部是方便测试
  const PROJECT_PATH = process.cwd();

  const type = analyzeBootType(loaderInst);
  const { resourcePath } = loaderInst;
  const options = getOptions(loaderInst);
  const { m } = options;

  if (type === BOOT_TYPE.COMPONENT) {
    // 处理组件入口
    const entry = './src/index.vx';
    const path = resolve(PROJECT_PATH, entry);
    if (existsSync(path)) {
      return path;
    }
    throw ENTRY_NOT_FOUND_ERROR;
  }

  // - 默认 boot 启动文件，使用绝对路径
  // - 反之使用相对路径
  const usingRelativePath = !isDefaultBoot(resourcePath);

  // 基准路径，后续算相对路径时需要以此为准
  // 根据 relativePath 的真值确定是否计算
  const basePath = dirname(resourcePath);

  if (type === BOOT_TYPE.APP_SINGLE_MODULE) {
    // 处理单入口
    // 需要额外查找 package.json 中是否配置 main
    const { main: mainConfig } = require(resolve(PROJECT_PATH, 'package.json')); /* eslint-disable-line */
    if (mainConfig) {
      const path = resolve(PROJECT_PATH, mainConfig);
      if (existsSync(path)) {
        return usingRelativePath ? `./${relative(basePath, path)}` : path;
      }

      throw ENTRY_NOT_FOUND_ERROR;
    }
  }

  const result = [
    `${DEFAULT_ENTRY_NAME}.vx`,
    'router.ts',
    'router.js',
  ]
    .map((item) => {
      // 处理多模块的情况
      if (m) {
        return resolve(PROJECT_PATH, 'src', MULTI_MODULES_DIR_NAME, m, item);
      }
      return resolve(PROJECT_PATH, 'src', item);
    })
    .find(item => existsSync(item));

  if (result) {
    return usingRelativePath ? `./${relative(basePath, result)}` : result;
  }

  throw ENTRY_NOT_FOUND_ERROR;
}

module.exports = findAppEntry;
