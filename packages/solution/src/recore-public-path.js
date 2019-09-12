if (window.g_config && window.g_config.publicPath) {
  // eslint-disable-next-line camelcase, no-undef
  __webpack_public_path__ = window.g_config.publicPath;
} else if (document.currentScript) {
  // eslint-disable-next-line camelcase, no-undef
  __webpack_public_path__ = document.currentScript.src.replace(/^(.*\/)[^/]+$/, '$1');
}
