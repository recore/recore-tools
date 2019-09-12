const { expect } = require('chai');
const SharedMemory = require('../../src/lib/shared-memory');

describe('test #SharedMemory', () => {
  it('#no-namespace', () => {
    try {
      new SharedMemory('hello-recore'); // eslint-disable-line
    } catch (err) {
      expect(err.message).to.equal('[SharedMemory] Error: Invalid namespace');
    }
  });

  it('#read and write successfully', () => {
    const shareMemory = new SharedMemory('hello-recore');
    const originData = { a: 100 };
    shareMemory.write(originData);
    const data = shareMemory.read();
    expect(data).to.eql(originData);
  });

  it('#read and write successfully with the same namespace', () => {
    const shareMemory1 = new SharedMemory('hello-recore');
    const originData1 = { a: 100 };
    const shareMemory2 = new SharedMemory('hello-recore');
    const originData2 = { a: 200 };

    shareMemory1.write(originData1);
    shareMemory2.write(originData2);
    const data1 = shareMemory1.read();
    const data2 = shareMemory2.read();
    expect(data1).to.eql(originData2);
    expect(data2).to.eql(originData2);
  });

  it('#read and write successfully with the different namespace', () => {
    const shareMemory1 = new SharedMemory('hello-recore');
    const originData1 = { a: 100 };
    shareMemory1.write(originData1);
    const data1 = shareMemory1.read();
    expect(data1).to.eql(originData1);

    const shareMemory2 = new SharedMemory('hello-recore2');
    const originData2 = { a: 200 };
    shareMemory2.write(originData2);
    const data2 = shareMemory2.read();
    expect(data2).to.eql(originData2);
    expect(data1).to.not.eql(originData2);
  });
});
