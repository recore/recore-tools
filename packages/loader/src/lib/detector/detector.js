const {
  dirname,
  relative,
  resolve,
} = require('path');
const { stat, statSync } = require('fs');


class Detector {
  constructor({ resourcePath, baseDir, routeMain }) {
    this.targets = [];
    this.init({ resourcePath, baseDir, routeMain });
  }

  init({ resourcePath, baseDir, routeMain }) {
    this.resourcePath = resourcePath;

    // 定义 base = dirname(resourcePath) + baseDir + :main
    // 如果 routeMain 带后缀，即文件怎么办？
    // 那么就交给子类去处理
    this.base = resolve(dirname(resourcePath), baseDir || './', routeMain || './');
  }

  resume(file, err) {
    if (err) {
      if (err.code === 'ENOENT') {
        this._iter.next({
          file, exist: false,
        });
        return;
      }
      this._iter.throw(err);
      return;
    }

    this._iter.next({
      file, exist: true,
    });
  }

  * iterator() {
    // const result = yield this.targets.map(f => stat(f, this.resume.bind(this, f)));
    for (let i = 0, max = this.targets.length; i < max; i += 1) {
      const f = this.targets[i];
      try {
        const r = yield stat(f, this.resume.bind(this, f));
        if (r.exist) {
          // console.log(`find ${f} from ${this.resourcePath}`);
          this.callback(null, f);
          return;
        }
      } catch (e) {
        this.callback(e);
        return;
      }
    }

    this.callback(null);
  }

  getRelativePath(f) {
    return `./${relative(dirname(this.resourcePath), f)}`;
  }

  /**
   * @param {function} addDependency webpack 的依赖增加
   * @param {boolean} isRelative 是否返回相对路径
   */
  detect({ isRelative = true, addDependency }) {
    const { targets } = this;

    if (!targets || targets.length === 0) {
      return Promise.resolve();
    }

    if (typeof addDependency === 'function') {
      for (let i = 0, max = targets.length; i < max; i++) { /* eslint-disable-line */
        addDependency(targets[i]);
      }
    }

    return new Promise((done, reject) => {
      this.callback = (err, f) => {
        if (err) {
          reject(err);
          return;
        }

        if (f) {
          done(isRelative ? this.getRelativePath(f) : f);
        } else {
          // const err = new Error(`No such router file in ${this.dirPath}`);
          // err.code = 'ENOENT';
          done();
        }
      };

      this._iter = this.iterator();
      this._iter.next();
    });
  }

  /**
   * 检查 base 是否是目录
   * @return {boolean}
   */
  isDir() {
    const { base } = this;
    try {
      const stats = statSync(base);
      return stats.isDirectory();
    } catch (e) {
      return false;
    }
  }

  /**
   * 检查 base 是否是省略后缀的 VX 文件
   * @return {boolean}
   */
  isVX() {
    const { base } = this;

    try {
      statSync(`${base}.vx`);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = Detector;
