const datacheck = require('../common/datacheck');

const checker = new datacheck('paramRule');
module.exports = checker.datacheck;
module.exports.config = checker.config;
