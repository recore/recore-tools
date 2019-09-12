const {
  join,
} = require('path');
const UXCoreAnalysis = require('../../src/lib/uxcore-analysis');

const DIR = join(process.cwd(), '__fixture__');

describe('test uxcore analysis', () => {
  it('#async should analysis successfully', async () => {
    const analysis = new UXCoreAnalysis(DIR);
    const result = await analysis.run();
    expect(result).toEqual({
      '@ali/inner-saltui': '0.11.17',
      '@ali/inner-uxcore': '0.11.17',
      saltui: '1.0.0',
      uxcore: '1.0.0',
    });
  });

  it('#sync should analysis successfully', () => {
    const analysis = new UXCoreAnalysis(DIR);
    const result = analysis.run('sync');
    expect(result).toEqual({
      '@ali/inner-saltui': '0.11.17',
      '@ali/inner-uxcore': '0.11.17',
      saltui: '1.0.0',
      uxcore: '1.0.0',
    });
  });
});
