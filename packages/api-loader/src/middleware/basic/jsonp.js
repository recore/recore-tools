const jp = require('jsonp');

function jsonp(arg, prev) {
  const config = arg.config;
  return new Promise((resolve, reject) => {
    jp(
      [config.host, config.baseUrl, config.url].filter(p => !!p).join('/').replace(/(\w)\/+/g, '$1/'),
      {
        param: new URLSearchParams(arg.param),
        timeout: config.timeout || 60000,
        prefix: config.prefix || '__jp',
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      }
    )
  })
}

module.exports = jsonp;
module.exports.default = jsonp;
