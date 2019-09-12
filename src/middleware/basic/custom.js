const registedFunctions = {};

module.exports = function (data, prev) {
  if (typeof registedFunctions[data.config.kind] === 'function') {
    return registedFunctions[data.config.kind](data, prev);
  }
  return Promise.reject(`custom kind [${data.config.kind}] should be regist`)
};

module.exports.register = function (name, func) {
  if (typeof name === 'function') {
    func = name;
    name = func.name;
  }
  registedFunctions[name] = func;
};