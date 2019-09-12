const { join } = require('path');

class RecoreFile {
  constructor({ name, ext, dir }) {
    this.name = name;
    this.ext = ext;
    this.dir = dir;
  }

  get path() {
    return join(this.dir, `${this.name}${this.ext}`);
  }
}

module.exports = RecoreFile;
