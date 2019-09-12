const { START, BUILD, SOLUTION } = require('../../symbol');

function pickCommonParams(config) {
  const keys = Object.keys(config);
  const result = {};
  for (const k of keys) {
    if (k === SOLUTION || k === START || k === BUILD) continue;

    if (config.hasOwnProperty(k)) {
      result[k] = config[k];
    }
  }
  return result;
}

module.exports = {
  pickCommonParams,
};
