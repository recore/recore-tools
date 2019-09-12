const { accessSync } = require('fs');
const { getOptions } = require('loader-utils');

const BOOT_TYPE = {
  COMPONENT: 'component',
  APP_SINGLE_MODULE: 'app-single-module',
  APP_MULTI_MODULES: 'app-multi-modules',
};

module.exports = {
  BOOT_TYPE,

  /**
   * 分析出属于哪种类型
   * @param {object} loaderInst loader 实例
   */
  analyzeBootType(loaderInst) {
    const options = getOptions(loaderInst) || {};
    const { component, m } = options;

    // 如果有 component 标志，指明当前是组件
    if (component) {
      return BOOT_TYPE.COMPONENT;
    }

    // 多入口
    if (m) {
      return BOOT_TYPE.APP_MULTI_MODULES;
    }

    return BOOT_TYPE.APP_SINGLE_MODULE;
  },

  /**
   * 判断是否使用来默认 bootstrap
   * 通过判断路径中是否包含 nowa-recore-solution，来判断是否是用了默认 bootstrap
   * @param {string} resourcePath
   */
  isDefaultBoot(resourcePath) {
    return /nowa-recore-solution/.test(resourcePath);
  },

  existsSync(path) {
    try {
      accessSync(path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
    return true;
  },
};
