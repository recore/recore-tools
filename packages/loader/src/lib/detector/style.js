const {
  basename,
  dirname,
  extname,
  resolve,
} = require('path');
const Detector = require('./detector');


class StyleDetector extends Detector {
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
          `${file.replace(ext, '')}.less`, `${file.replace(ext, '')}.scss`, `${file.replace(ext, '')}.css`, // vx 文件同名
        ];
        break;
      default:
        targets = [
          `${file.replace(ext, '')}.less`, `${file.replace(ext, '')}.scss`, `${file.replace(ext, '')}.css`, // vx 文件同名
          'index.less', 'index.scss', 'index.css',
          `${dirName}.less`, `${dirName}.scss`, `${dirName}.css`, // 目录名
        ];
        break;
    }
    this.targets = targets.map(item => resolve(dirPath, item));
  }
}

module.exports = StyleDetector;
