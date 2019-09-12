const { default: template } = require('@babel/template');
const { default: traverse } = require('@babel/traverse');
const t = require('@babel/types');


/**
 * 在 bootstrap 文件中，注入
 * import App from '/path/to/app.vx'
 * @param {object} ast
 * @param {string} entry 入口路径
 * @param {object} config
 */
function injectImportApp(ast, entry, config) {
  const { program: { body: astBody } } = ast;

  // 查找插入的位置，最后一个 import 下面
  let i = astBody.length - 1;
  for(; i >= 0; i--) { // eslint-disable-line
    const node = astBody[i];
    if (t.isImportDeclaration(node)) {
      break;
    }
  }

  ast.program.body.splice(i + 1, 0, template(`
  import IMPORT_NAME from 'SOURCE';
  `, config)({
    IMPORT_NAME: t.identifier('App'),
    SOURCE: t.stringLiteral(entry),
  }));


  // 遍历 ast
  traverse(ast, {
    enter(path) {
      // 下面这段代码：经过 babel 转译之后的代码插入 App 变量
      // if (t.isCallExpression(path)
      //   && t.isExpressionStatement(path.parent)
      //   && t.isCallExpression(path.parent.expression)) {
      //   path.parent.expression.arguments.unshift(t.identifier('App'));
      //   return;
      // }

      // runApp 增加 App 调用参数
      if (path.isIdentifier({ name: 'runApp' }) && t.isCallExpression(path.parent)) {
        path.parent.arguments.unshift(t.identifier('App'));
      }
    },
  });
}

module.exports = injectImportApp;
