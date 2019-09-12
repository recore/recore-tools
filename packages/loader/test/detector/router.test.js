// const sinon = require('sinon');
const { resolve } = require('path');
const { expect } = require('chai');

const { RouterEntryDetector } = require('../../src/lib/detector');

const FIXTURES_PATH = resolve(__dirname, '__fixtures__');

// sinon.spy(RouterEntryDetector.prototype, 'detect');
// RouterEntryDetector.prototype.detect.restore();

describe('test RouterEntryDetector', () => {
  it('#found', async () => {
    const resourcePath = resolve(FIXTURES_PATH, './exist-router/about.vx');
    const detector = new RouterEntryDetector({ resourcePath });
    const data = await detector.detect({});
    expect(data).to.equal('./router.ts');
  });

  it('#not found', (done) => {
    const resourcePath = resolve(FIXTURES_PATH, './exist-router');
    const detector = new RouterEntryDetector({ resourcePath });
    detector.detect({}).then((filePath) => {
      expect(filePath).to.equal(undefined);
      done();
    });
  });

  it('#found(with dot in path)', async () => {
    const resourcePath = resolve(FIXTURES_PATH, './exist-router.2/about.vx');
    const detector = new RouterEntryDetector({ resourcePath });
    const data = await detector.detect({});
    expect(data).to.equal('./router.ts');
  });

  it('#not found(with dot in path)', (done) => {
    const resourcePath = resolve(FIXTURES_PATH, './exist-router.2');
    const detector = new RouterEntryDetector({ resourcePath });
    detector.detect({}).then((filePath) => {
      expect(filePath).to.equal(undefined);
      done();
    });
  });
});
