/**
 * 批量获取/注册 spm b 码
 */

const chalk = require('chalk');
const logger = require('../../lib/logger');
const SpmBRegister = require('../../lib/spm-b-register');
const { boot: sharedBoot } = require('../share');

class RegisterHelper {
  async run(routes) {
    const { spmA, domain } = sharedBoot.read() || {};
    const register = new SpmBRegister({ spmA, domain });

    if (!spmA || !domain) {
      // 不需要获取 B 码
      return Promise.resolve(routes.map((item) => {
        delete item.spmB;
        return item;
      }));
    }

    const jobs = routes.map((item) => {
      // 过滤掉 redirect
      if (item.redirect) {
        return Promise.resolve(null);
      }

      // 处理自动获取 B 码
      if (item.spmB === true) {
        return register.run(item.title || item.path, item.path).catch((err) => {
          logger.error(chalk.red(`FAILED. Got the spmB of the path ${item.path}. ${err.message}`));
          return null;
        });
      }

      // 其他情况
      return Promise.resolve(null);
    });

    return Promise.all(jobs).then(result => result.map((item, index) => {
      if (!item) {
        return {
          ...routes[index],
        };
      }

      const b = Object.values(item)[0];
      if (!b) {
        delete routes[index].spmB;
        return {
          ...routes[index],
        };
      }
      return {
        ...routes[index],
        spmB: b,
      };
    }));
  }
}

module.exports = RegisterHelper;
