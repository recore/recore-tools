const fs = require('fs');
const path = require('path');
const ThemeAssetTest = require('../../../src/plugins/theme-dev-builder/theme-asset');

const FIXTURE_PATH = path.join(__dirname, '../../../__fixture__');

describe('test ThemeAsset', () => {
  it('should be ok', () => {
    const source = fs.readFileSync(path.join(FIXTURE_PATH, 'themes/dark.theme.js'), { encoding: 'utf8' });
    const asset = new ThemeAssetTest(source);
    expect(asset.source()).toEqual(expect.stringContaining('.dp-section-card-container'));
    expect(asset.source()).toEqual(expect.stringContaining('.homepage'));
    expect(asset.source()).not.toEqual(expect.stringContaining('\\n'));
    expect(asset.source()).not.toEqual(expect.stringContaining('\\"'));
  });
});
