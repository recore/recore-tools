const Plugin = require('../../src/plugins/parse-config');
const { START, BUILD } = require('../../src/symbol');

const runner = {};
const config = {
  solution: '@ali/nowa-recore-solution',
  alias: {
    component: './component',
  },
  externals: {
    $: 'jQuery',
  },
  [START]: {
    open: false,
    proxy: {
      '/api': 'http://localhost:3000/',
    },
  },
  [BUILD]: {
    filename: 'recore-app.html',
  },
};
const logger = {
  error: jest.fn(),
  debug: jest.fn(),
};

describe('test the plugin: parse-config', () => {
  beforeEach(() => {
    logger.error.mockClear();
    logger.debug.mockClear();
  });

  it('should run command-start successfully', (done) => {
    const args = {
      config,
      commands: ['start'],
    };

    runner.$register = jest.fn((stage, callback) => {
      callback(args).then((result) => {
        expect(result).toEqual({
          open: false,
          proxy: {
            '/api': 'http://localhost:3000/',
          },
          alias: {
            component: './component',
          },
          externals: {
            $: 'jQuery',
          },
        });
        done();
      });
    });

    const plugin = new Plugin();
    plugin.apply(runner, { logger });
  });

  it('should run command-build successfully', (done) => {
    const args = {
      config,
      commands: ['build'],
    };

    runner.$register = jest.fn((stage, callback) => {
      callback(args).then((result) => {
        expect(result).toEqual({
          filename: 'recore-app.html',
          alias: {
            component: './component',
          },
          externals: {
            $: 'jQuery',
          },
        });
        done();
      });
    });

    const plugin = new Plugin();
    plugin.apply(runner, { logger });
  });

  it('should return empty if the command is not exist', (done) => {
    const args = {
      config,
      commands: ['xx'],
    };

    runner.$register = jest.fn((stage, callback) => {
      callback(args).then((result) => {
        expect(result).toEqual({});
        expect(logger.error).toBeCalledWith('Invalid command: xx');
        expect(logger.error.mock.calls.length).toEqual(1);
        done();
      });
    });

    const plugin = new Plugin();
    plugin.apply(runner, { logger });
  });
});
