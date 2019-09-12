const { expect } = require('chai');
const { sequence, parse } = require('../../src/lib/formatter/util');

describe('test the utility libaray', () => {
  it('should pass generating the sequence', () => {
    const result = sequence(2, 10);
    const expected = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(result.length).to.equal(expected.length);
    expect(result[0]).to.equal(expected[0]);
    expect(result.slice(-1)[0]).to.equal(expected.slice(-1)[0]);
  });

  it('should parse the code success when the error occured at the middle', () => {
    const err = {
      message: 'xx',
      loc: {
        line: 3,
        column: 1,
      },
    };
    const file = '/path/to/file';
    const src = `<div>
    <p>hello, recore</p>
    <p>
    </div>`;

    const result = parse(err, src, file);
    expect(result.message).to.equal(err.message);
    expect(result.outputLineno).to.have.all.members([1, 2, 3, 4]);
  });
  it('should parse the code success when the error occured at the top', () => {
    const err = {
      message: 'xx',
      loc: {
        line: 1,
        column: 1,
      },
    };
    const file = '/path/to/file';
    const src = `<div>
    <p>hello, recore</p>
    <p>
    </div>`;

    const result = parse(err, src, file);
    expect(result.message).to.equal(err.message);
    expect(result.outputLineno).to.have.all.members([1, 2, 3]);
  });
  it('should parse the code success when the error occured at the bottom', () => {
    const err = {
      message: 'xx',
      loc: {
        line: 4,
        column: 1,
      },
    };
    const file = '/path/to/file';
    const src = `<div>
    <p>hello, recore</p>
    <p>
    </div>`;

    const result = parse(err, src, file);
    expect(result.message).to.equal(err.message);
    expect(result.outputLineno).to.have.all.members([2, 3, 4]);
  });
});
