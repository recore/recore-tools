const { resolve } = require('path');

class LoadConfigPlugin {
  apply(runner, { logger }) {
    runner.$register('load-config', async ({ context }) => {
      const path = resolve(context, 'recore.config.js');
      logger.debug(`Load solution configuration from PATH: ${path}`);
      try {
        const content = require(path); // eslint-disable-line
        return Object.assign({}, content, {
          solution: '@recore/solution',
        });
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          throw err;
        }
        logger.warn('No Recore configuration. FALLBACK');
        logger.debug(err);
        return {
          solution: '@recore/solution',
        };
      }
    });
  }
}

module.exports = LoadConfigPlugin;
