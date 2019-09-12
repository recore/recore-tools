class ThemeAssetError extends Error {
  /**
   * @param {string} message
   * @param {Error} error?
   */
  constructor(message, error) {
    super(`${message}${error ? `: ${error.message}` : ''}`);
    this._parentError = error;
  }

  get name() {
    return 'ThemeAssetError';
  }
}

module.exports = ThemeAssetError;
