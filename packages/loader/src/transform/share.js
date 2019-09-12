const SharedMemory = require('../lib/shared-memory');

const boot = new SharedMemory('boot');

module.exports = {
  boot,
};
