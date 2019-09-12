const { join } = require('path');
const { readFile, readFileSync } = require('fs');

const TARGETS = ['uxcore', '@ali/inner-uxcore', 'saltui', '@ali/inner-saltui'];

function extractSync(file) {
  try {
    const content = readFileSync(file);
    const pkg = JSON.parse(content);
    const { name, version } = pkg;
    if (name && version) {
      return {
        [name]: version,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function extract(file) {
  return new Promise((resolve) => {
    readFile(file, (err, data) => {
      if (err) {
        resolve(null);
        return;
      }
      try {
        const pkg = JSON.parse(data);
        resolve(pkg.version && pkg.name
          ? { [pkg.name]: pkg.version }
          : null);
      } catch (err) { // eslint-disable-line
        resolve(null);
      }
    });
  });
}

function merge(result) {
  // 这里在合并各项时，还会过滤 null 值
  return result.reduce((acc, current) => Object.assign({}, acc, current), {});
}

class UXCoreAnalysis {
  constructor(dir) {
    this.nodeModulesPath = join(dir, 'node_modules');
  }

  run(mode = 'async') {
    const { nodeModulesPath } = this;
    const files = TARGETS
      .map(t => join(nodeModulesPath, t, 'package.json'));

    if (mode === 'sync') {
      const resultSync = files.map(extractSync);
      return merge(resultSync);
    }

    if (mode === 'async') {
      const jobs = files.map(extract); // eslint-disable-
      return Promise.all(jobs).then(merge);
    }

    throw new Error('[UXCore Analysis] ERROR: 未知运行模式');
  }
}


module.exports = UXCoreAnalysis;
