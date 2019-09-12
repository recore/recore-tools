function formatter(data, prev) {
  return new Promise((resolve, reject) => {
    if (prev && (prev.data || prev.content)) {
      return resolve(prev.data || prev.content)
    }
    reject(prev.errMsg || 'no data or content');
  });
}

module.exports = formatter;
module.exports.default = formatter;