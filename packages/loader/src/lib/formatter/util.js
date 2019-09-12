/**
 * 向左填充
 * @param {number} n
 * @param {string} fill
 */
function leftPad(n, fill = ' ') {
  if (n <= 0) return '';
  return Array(n + 1).join(fill);
}

function sequence(start, end, step = 1) {
  return Array(end - start + 1).fill(0).map((item, index) => start + index * step);
}

// 将错误代码位置、信息定位出来
function parse(err, src, file) {
  if (typeof err === 'string') {
    return {
      file,
      error: 'UnknowError',
      message: err,
      output: [],
      outputLineno: [],
      position: { line: -1, column: -1 },
    };
  }

  const errName = err.name;
  const message = err.message.replace(/\s+\(\d+:\d+\)$/, '');
  const { line, column } = err.loc || {};
  const aSrc = src.split('\n');
  const errSrc = aSrc[line - 1];
  const upSrc = aSrc.slice(line - 3, line - 1);
  const downSrc = aSrc.slice(line, line + 2);

  return {
    file,
    error: errName,
    message,
    output: [].concat(upSrc).concat([errSrc]).concat(downSrc),
    outputLineno: sequence(line - upSrc.length, line + downSrc.length),
    position: { line, column },
  };
}

module.exports = {
  sequence,
  leftPad,
  parse,
};
