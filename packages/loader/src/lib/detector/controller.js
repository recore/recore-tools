const {
  basename,
  dirname,
  extname,
  resolve,
} = require('path');
const Detector = require('./detector');


class ControllerDetector extends Detector {
  /**
   * @param {string} resourcePath 探测资源的起点
   * @param {string} [mode=default] 探测模式：default=>默认模式，same=>和视图文件同名
   */
  constructor({ resourcePath, mode = 'default' }) {
    super({ resourcePath });
    this.init({ resourcePath, mode });
  }

  init({ resourcePath, mode }) {
    super.init({ resourcePath });

    const file = basename(resourcePath);
    const ext = extname(file);
    const dirPath = dirname(resourcePath);
    const dirName = basename(dirPath);

    let targets;
    switch (mode) {
      case 'same':
        targets = [
          `${file.replace(ext, '')}.js`, `${file.replace(ext, '')}.ts`, // vx 文件同名
        ];
        break;
      default:
        targets = [
          `${file.replace(ext, '')}.js`, `${file.replace(ext, '')}.ts`, // vx 文件同名
          'index.js', 'index.ts',
          `${dirName}.js`, `${dirName}.ts`, // 目录名
        ];
        break;
    }
    this.targets = targets.map(item => resolve(dirPath, item));
  }
}

module.exports = ControllerDetector;
