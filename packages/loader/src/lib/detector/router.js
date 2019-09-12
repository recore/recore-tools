const {
  dirname,
  resolve,
} = require('path');
const Detector = require('./detector');


class RouterEntryDetector extends Detector {
  init({ resourcePath, baseDir, routeMain }) {
    super.init({ resourcePath, baseDir, routeMain });

    const { base } = this;
    if (this.isDir()) {
      this.targets = ['router.js', 'router.ts']
        .map(filename => resolve(base, filename));
      return;
    }

    if (this.isVX()) {
      this.targets = ['router.js', 'router.ts']
        .map(filename => resolve(dirname(base), filename));
    }
  }
}

module.exports = RouterEntryDetector;
