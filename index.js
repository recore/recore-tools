const transform = require('./src/index');
const { getOptions } = require('loader-utils');
const solutions = require('./src/solutions');

let hasSetSolution = false;

/**
 * Webpack loader see:
 * https://webpack.js.org/contribute/writing-a-loader/
 */
function processChunk(source) {
  const options = getOptions(this);
  if (!hasSetSolution && options.solutions) {
    hasSetSolution = true;
    solutions.setSolutions(options.solutions);
  }
  return transform.fromCode(this.resourcePath, source, options.mock);
}

module.exports = processChunk; 