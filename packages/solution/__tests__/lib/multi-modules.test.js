const { join } = require('path');
const MultiModules = require('../../src/lib/multi-modules');

const PRO_DIR_PATH = join(__dirname, '../../__fixture__', 'multi-modules-demo');
const MODULES_PATH = join(PRO_DIR_PATH, './src/modules');
const DEFAULT_BOOTSTRAP_PATH = join(PRO_DIR_PATH, './src/bootstrap.ts');

describe('test multi modules', () => {
  it('should pass', async () => {
    const multiModules = new MultiModules({
      resourePath: MODULES_PATH,
      defaultBootstrapPath: DEFAULT_BOOTSTRAP_PATH,
    });

    await multiModules.scan();

    const { entries } = multiModules;
    expect(entries).toEqual({
      admin: `${MODULES_PATH}/admin/bootstrap.ts?boot&m=admin`,
      frontend: `${MODULES_PATH}/frontend/bootstrap.js?boot&m=frontend`,
      xux: `${DEFAULT_BOOTSTRAP_PATH}?boot&m=xux`,
    });
  });
});
