const Path = require('path');
const { scan, select } = require('../../src/lib/theme-utils');

const PROJECT_PATH = Path.resolve(__dirname, '../../');

describe('test Lib::ThemeUtils', () => {
  it('should scan successfully', () => {
    const entry = Path.resolve(PROJECT_PATH, '__fixture__/themes');
    const result = scan(entry);
    expect(result).toEqual({
      'dark.theme': Path.resolve(entry, 'dark.theme.less'),
      'light.theme': Path.resolve(entry, 'light.theme.less'),
    });
  });

  it('should throw error if there is no entry', () => {
    expect.assertions(1);

    const entry = Path.resolve(PROJECT_PATH, '__fixture__/themes-faker');
    expect(() => scan(entry)).toThrow(/^ENOENT: no such file or directory/);
  });

  it('should return empty object if there is no themes', () => {
    const entry = Path.resolve(PROJECT_PATH, '__fixture__/themes-empty');
    const result = scan(entry);
    expect(result).toEqual({});
  });

  it('should select the abc theme', () => {
    const themes = ['bcd.theme', 'abc.theme', 'xyz.theme'];
    const selected = select(themes);
    expect(selected).toEqual('abc.theme');
  });

  it('should return null if the themes can not be selected', () => {
    const selected = select();
    expect(selected).toEqual(null);
  });
});
