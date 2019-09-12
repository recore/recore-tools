/**
 * 基于 memory-fs 实现同步版本内存共享
 */

const assert = require('assert');
const MemoryFileSystem = require('memory-fs');
const { join } = require('path');

const mfs = new MemoryFileSystem();
const container = {}; // 管理 namespace
const PREFIX = 'RECORE';
const rootDir = `/${PREFIX}`;

mfs.mkdirpSync(rootDir); // 创建根目录

class SharedMemory {
  constructor(namespace) {
    assert(namespace, '[SharedMemory] Error: Invalid namespace');
    if (container[namespace]) {
      return container[namespace];
    }
    this._file = join(rootDir, namespace);
    mfs.writeFileSync(this._file, '0'); // 通过这种方式创建文件
    container[namespace] = this;
  }

  // 先实现同步版本
  read() {
    return JSON.parse(mfs.readFileSync(this._file));
  }

  // 先实现同步版本
  write(data) {
    // 通过 json 序列化，进行深度拷贝
    return mfs.writeFileSync(this._file, JSON.stringify(data));
  }
}


module.exports = SharedMemory;
