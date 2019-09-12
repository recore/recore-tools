const axios = require('axios');

function ajax(arg, prev) {
  const config = arg.config;
  const method = (config.method || 'post').toLowerCase();
  const reqConfig = {
    url: [config.host, config.baseUrl, config.url].filter(p => !!p).join('/').replace(/(\w)\/+/g, '$1/'),
    method: (config.method || 'post').toLowerCase(),
    params: null,
    data: null,
  };
  if (method === 'get') {
    reqConfig.params = arg.param;
  } else {
    reqConfig.data = arg.param;
  }
  return axios(reqConfig).then(res => res.data);
}

module.exports = ajax;
module.exports.default = ajax;
