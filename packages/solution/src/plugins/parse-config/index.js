const {
  START, BUILD, UPGRADE, DEPLOY,
} = require('../../symbol');
const { pickCommonParams } = require('./util');

class ParseConfigPlugin {
  apply(runner, { logger }) {
    runner.$register('parse-config', async ({ config, commands }) => {
      const [command] = commands;

      const _start = config[START];
      const _build = config[BUILD];
      const _upgrade = config[UPGRADE];
      const _deploy = config[DEPLOY];
      const commonParams = pickCommonParams(config);

      let result = {};

      switch (command) {
        case 'start':
          result = Object.assign({}, commonParams, _start);
          break;

        case 'build':
          result = Object.assign({}, commonParams, _build);
          break;

        case 'upgrade':
          result = Object.assign({}, commonParams, _upgrade);
          break;

        case 'deploy':
          result = Object.assign({}, commonParams, _deploy);
          break;

        default:
          logger.error(`Invalid command: ${command}`);
          break;
      }

      logger.debug('[Solution::Recore]: ', result);

      return result;
    });
  }
}

module.exports = ParseConfigPlugin;
