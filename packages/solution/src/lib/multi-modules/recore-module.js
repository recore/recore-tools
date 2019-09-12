/**
 * Recore 定义的模块
 */

const fs = require('fs-extra');
const { join } = require('path');
const RecoreFile = require('./recore-file');

class RecoreModule {
  constructor({ name, dir }) {
    this.name = name; // 模块的名称
    this.dir = dir; // 模块所在目录地址
    this.files = {};
  }

  /**
   * 扫描资源
   * 记录 index.html/bootstrap.ts 的位置
   * 不存在的情况使用 null 替代
   */
  async scan() {
    return Promise.all([
      this.findBootstrap(),
      this.findIndexHTML(),
    ]);
  }

  /**
   * 查找 bootstrap (这里省略后缀，因为有 2 种可能性)
   */
  async findBootstrap() {
    const { dir } = this;
    const bootstrapTSPath = join(dir, 'bootstrap.ts');
    return fs.exists(bootstrapTSPath).then((result) => { // eslint-disable-line
      if (result) {
        this.files.bootstrap = new RecoreFile({
          name: 'bootstrap',
          ext: '.ts',
          dir,
        });
      } else {
        const bootstrapJSPath = join(dir, 'bootstrap.js');
        return fs.exists(bootstrapJSPath).then((result2) => {
          if (result2) {
            this.files.bootstrap = new RecoreFile({
              name: 'bootstrap',
              ext: '.js',
              dir,
            });
          }
        });
      }
    });
  }

  /**
   * 查找 index.html
   */
  async findIndexHTML() {
    const { dir } = this;
    const indexHTMLPath = join(dir, 'index.html');
    return fs.exists(indexHTMLPath).then((result) => {
      if (result) {
        this.files['index.html'] = new RecoreFile({
          name: 'index',
          ext: '.html',
          dir,
        });
      }
    });
  }

  /**
   * 获取 HTML 内容
   * @return {null|string}
   */
  get html() {
    const { files } = this;
    const indexHTML = files['index.html'];
    if (indexHTML) {
      return fs.readFileSync(indexHTML.path, 'utf8');
    }
    return null;
  }
}

module.exports = RecoreModule;
