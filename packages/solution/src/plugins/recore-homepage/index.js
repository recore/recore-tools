const {
  logger,
} = require('../../utils');
const RecoreHelper = require('./recore-helper');


class RecoreHomepagePlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'RecoreHomepagePlugin',
      (compilation, callback) => {
        const { context, outputPath, options: { entry } } = compiler;
        const recore = new RecoreHelper(context);
        const filename = Object.keys(entry).find(name => name.includes('min'));

        recore.build({ outputPath, filename }, (err) => {
          if (err) {
            logger.err('Build the homepage failed: ', err.message);
          }
          callback();
        });
      },
    );
  }
}

module.exports = RecoreHomepagePlugin;
