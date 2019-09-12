const Detector = require('./detector');


class FileDetector extends Detector {
  init({ resourcePath, baseDir, routeMain }) {
    super.init({ resourcePath, baseDir, routeMain });
    this.targets = [this.base];
  }
}

module.exports = FileDetector;
