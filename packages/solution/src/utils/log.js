const chalk = require('chalk');

const { log } = console;
class Log {
  constructor(logTitle) {
    this.chalk = chalk;
    this.baseMsg = chalk.keyword('orange')(`[${logTitle || '[RECORE SOLUTION]'}]:`);
    this.log = log.bind(null, this.baseMsg);
  }

  success(...args) {
    this.log(this.chalk.green(...args));
  }

  error(...args) {
    this.log(this.chalk.red(...args));
  }

  err(...args) {
    this.log(this.chalk.red(...args));
  }

  warn(...args) {
    this.log(this.chalk.yellow(...args));
  }

  debug(...args) {
    if (process.env.XDEV_DEBUG === 'true') {
      this.log(this.chalk.gray(...args));
    }
  }

  info(...args) {
    this.log(...args);
  }
}


function logger(...agrs) {
  log(...agrs);
}


module.exports = function logFunc(logTitle) {
  const _log = new Log(logTitle);
  Object.setPrototypeOf(logger, _log);
  return logger;
};
