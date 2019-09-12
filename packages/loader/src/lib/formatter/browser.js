/**
 * 输出到浏览器展示
 * @param {Error} err
 * @param {string} src
 * @param {string} file
 */

const { parse, leftPad } = require('./util');
const { S_AREA } = require('../../transform/vx/builders');

function toBrowser(err, src, file) {
  const result = parse(err, src, file);
  const n = `${result.position.line}`.length;
  const output = [];

  if (result.output.length > 0) {
    result.output.forEach((line, idx) => {
      const lineno = result.outputLineno[idx];
      if (lineno !== result.position.line) {
        output.push(`${S_AREA}.create('span', null, ['  ${leftPad(n - `${lineno}`.length, ' ')}${lineno} | ', ${JSON.stringify(line)}])`);
      } else {
        output.push(`${S_AREA}.create('span', null, ['> ${lineno} | ', ${JSON.stringify(line)}])`);
        output.push(`${S_AREA}.create('span', null, '${leftPad(n * 2 + 4, ' ')}${leftPad(result.position.column - 1, '-')}^')`);
      }
    });
  }

  return `${S_AREA}.create('p', {
    style: {
      fontFamily: 'monospace',
      fontSize: '14px',
      display: 'block',
      padding: '0.5em',
      marginLeft: 'auto',
      marginRight: 'auto',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      borderRadius: '0.25rem',
      backgroundColor: 'rgba(206, 17, 38, 0.05)',
      width: '60%'
    }}, [
      ${S_AREA}.create('span', null, 'ERROR at ${result.file || '(anonymous file)'}:${result.position.line}:${result.position.column}'),
      ${S_AREA}.create('br'),
      ${S_AREA}.create('span', null, ['${result.error}: ', ${JSON.stringify(result.message)}]),
      ${S_AREA}.create('br'), ${output.join(`,${S_AREA}.create('br'),`)}
    ])`;
}

module.exports = toBrowser;
