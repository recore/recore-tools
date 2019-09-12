const { default: generate } = require('@babel/generator');
const vm = require('vm');


function parseMonitor(ast) {
  // 处理找到的 monitor
  const sandbox = {};
  vm.createContext(sandbox);
  try {
    const { code: monitor } = generate(ast, { sourceMaps: false });
    const code = `var result = ${monitor.replace(/\n/g, '')}`;
    vm.runInContext(code, sandbox);
    return sandbox.result;
  } catch (err) {
    return null;
  }
}

module.exports = parseMonitor;
