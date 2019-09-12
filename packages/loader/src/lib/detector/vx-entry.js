/**
 * 导入路由资源探测器
 */

const {
  basename,
  resolve,
} = require('path');

const Detector = require('./detector');
const logger = require('../logger');


class VXDetector extends Detector {
  /**
   * 探测是否存在入口 vx
   * @exception https://nodejs.org/docs/latest/api/errors.html#errors_common_system_errors
   * @param {string} isRelative 控制返回的路径是否是相对路径
   * @return {string} 如果找到则根据是否显示相对路径返回，如果没有找到，返回 null
   */
  init({ resourcePath, baseDir, routeMain }) {
    super.init({ resourcePath, baseDir, routeMain });

    const { base } = this;

    logger.debug('base: ', base);
    logger.debug('resourcePath: ', resourcePath);

    if (this.isDir()) {
      // 探测和文件夹同名 vx 文件已经 index.vx 文件
      this.targets = [`${basename(base)}.vx`, 'index.vx']
        .map(item => resolve(base, item));
      return;
    }

    if (this.isVX()) {
      this.targets.push(`${base}.vx`);
    }
  }
}

module.exports = VXDetector;
