const contextMatcher = require('http-proxy-middleware/lib/context-matcher');
const configFactory = require('http-proxy-middleware/lib/config-factory');

function _shouldProxy(context, req) {
  const path = (req.originalUrl || req.url);
  return contextMatcher.match(context, path, req);
}

class ShouldProxy {
  constructor(proxyOptions) {
    this.init(proxyOptions);
  }

  init(data) {
    if (!data) {
      this._contexts = [];
      return;
    }
    const options = {
      proxy: data,
    };
    if (!Array.isArray(options.proxy)) {
      options.proxy = Object.keys(options.proxy).map((context) => {
        let proxyOptions;
        // For backwards compatibility reasons.
        const correctedContext = context
          .replace(/^\*$/, '**')
          .replace(/\/\*$/, '');

        if (typeof options.proxy[context] === 'string') {
          proxyOptions = {
            context: correctedContext,
            target: options.proxy[context],
          };
        } else {
          proxyOptions = Object.assign({}, options.proxy[context]);
          proxyOptions.context = correctedContext;
        }

        proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

        return proxyOptions;
      });
    }

    this._contexts = options.proxy.map((proxyConfigOrCallback) => {
      let proxyConfig;

      if (typeof proxyConfigOrCallback === 'function') {
        proxyConfig = proxyConfigOrCallback();
      } else {
        proxyConfig = proxyConfigOrCallback;
      }

      const context = proxyConfig.context || proxyConfig.path;
      const config = configFactory.createConfig(context, proxyConfig);

      return config.context;
    });
  }

  should(req) {
    if (this._contexts.length === 0) return false;
    return this._contexts.some(context => _shouldProxy(context, req));
  }
}

module.exports = ShouldProxy;
