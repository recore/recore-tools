const ThemeAssetError = require('./theme-asset-error');

class ThemeAsset {
  constructor(source) {
    this.init(source);
  }

  init(source) {
    const regex = /exports\.push\(\[module\.i, "(.*?)", ""]\);/gm;
    const css = [];
    let m;

    while ((m = regex.exec(source)) !== null) { // eslint-disable-line
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++; // eslint-disable-line
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          try {
            css.push(JSON.parse(`"${match}"`));
          } catch (error) {
            throw new ThemeAssetError('extract the css failed', error);
          }
        }
      });
    }

    if (css.length > 0) {
      this._source = css.join('\n');
    } else {
      this._source = '';
    }
  }

  source() {
    return this._source;
  }

  size() {
    return this._source.length;
  }
}

module.exports = ThemeAsset;
