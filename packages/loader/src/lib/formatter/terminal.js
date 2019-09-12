/**
 * 输出到终端展示
 * @param {Error} err
 * @param {string} src
 * @param {string} file
 */

const chalk = require('chalk');
const { parse, leftPad } = require('./util');

function toTerminal(err, src, file) {
  const result = parse(err, src, file);
  const output = [];
  const n = `${result.position.line}`.length;

  output.push(chalk.red(`ERROR at ${result.file || '(anonymous file)'}:${result.position.line}:${result.position.column}`));
  output.push(chalk.red(`${result.error}: ${result.message}`));

  result.output.forEach((line, idx) => {
    const lineno = result.outputLineno[idx];
    if (lineno !== result.position.line) {
      output.push(`  ${leftPad(n - `${lineno}`.length)}${chalk.gray(`${lineno} | `)}${chalk.yellow(line)}`);
    } else {
      output.push(`${chalk.red('> ')}${chalk.gray(`${lineno} | `)}${chalk.yellow(line)}`);
      output.push(`${chalk.gray(`${leftPad(n + 2 + 1)}| `)}${leftPad(result.position.column)}${chalk.red('^')}`);
    }
  });

  return `\n${output.join('\n')}\n`;
}

module.exports = toTerminal;
