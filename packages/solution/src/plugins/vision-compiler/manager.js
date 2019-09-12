/**
 * 管理可视化后端编译和通信
 */

const fs = require('fs');
const { join } = require('path');

const { env: { DEBUG_SOLUTION } } = process;


class Manager {
  get ctxPath() {
    return this._ctxPath;
  }

  constructor({ bootstrapPath, ctxPath }) {
    this._ctxPath = ctxPath;
    this._bootstrapPath = bootstrapPath;
    this._fakeEntry = join(__dirname, 'vision-entry.ts');
    this._visionFile = null;
  }

  /**
   * 外部资源变化通知
   * 主要接收 open 指令
   */
  listen() {
    process.on('message', (filePath) => {
      this._modify(filePath);
    });
  }

  /**
   * 修改入口文件
   * 会将该路径写入可视化编译的入口
   * @param {string} filePath
   */
  _modify(filePath) {
    const content = `import { controllerCallback } from "@ali/recore";
import "${this._bootstrapPath}";
import C from "${filePath}";
controllerCallback(C);
`;
    // solution 一般安装在用户目录，所以不存在无权写入的问题
    fs.writeFile(this._fakeEntry, content,
      { encoding: 'utf8' },
      (err) => { if (err) throw err; });
  }

  /**
   * 编译结束通知
   * 把编译的结果通知到外界
   * @param {Error[]} errors
   * @param {string} source 编译结果
   */
  done(errors, source) {
    this._send(errors, source);
  }

  /**
   * 内部分装的发送方法
   * @param {Error[]} errors
   * @param {string} source
   */
  _send(errors, source) {
    if (errors && errors.length > 0) {
      console.error(errors);
    }

    if (typeof process.send === 'function') {
      process.send({
        error: errors && errors.map(err => err.message).join('\n'),
        source,
      });
    } else if (!DEBUG_SOLUTION) {
      console.info(source);
    }
  }
}

module.exports = Manager;
