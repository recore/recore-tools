const datacheck = require('../common/datacheck');

const checker = new datacheck('returnRule');
module.exports = checker.datacheck;
module.exports.config = checker.config;