function requireDefault(path) {
  const obj = require(path); // eslint-disable-line
  return obj && obj.__esModule ? obj.default : obj;
}

module.exports = {
  // babelrc: false, // 默认参数
  extensions: ['.ts', ''],
  presets: [
    requireDefault('@babel/preset-env'),
    requireDefault('@babel/preset-typescript'),
  ],
  plugins: [
    requireDefault('@babel/plugin-proposal-class-properties'),
    requireDefault('@babel/plugin-proposal-object-rest-spread'),
  ],
};
