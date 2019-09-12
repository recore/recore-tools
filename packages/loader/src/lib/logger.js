const weblog = require('webpack-log');

const DEBUG = process.env.RECORE_LOADER_DEBUG;
const logger = weblog({
  name: 'RECORE LOADER',
  level: DEBUG ? 'debug' : 'info',
});

module.exports = logger;
