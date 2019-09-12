const { parse } = require('@babel/parser');
const { default: generate } = require('@babel/generator');
const { default: template } = require('@babel/template');
const t = require('@babel/types');
const { getOptions } = require('loader-utils');
const findAppEntry = require('./find-app-entry');
const generateSpmFuncAst = require('./generate-spm-function-ast');
const { boot: sharedBoot } = require('../share');
const injectImportApp = require('./inject-import-app');


module.exports = function processChunk(source) {
  this.cacheable();
  const callback = this.async();
  const { resourcePath } = this;
  const { spmA, domain, component } = getOptions(this) || {};
  const file = findAppEntry(this);

  if (!file) {
    callback(new Error('[RECORE LOADER] ERROR: the booting file is unknown.'));
    this.addDependency(file);
    return;
  }

  const isRouter = file.lastIndexOf('router') > 0;
  const basename = encodeURIComponent('/');
  const entry = isRouter /* eslint-disable-line */
    ? `${file}?router&asEntry&basename=${basename}` // TODO: 这里假设从 / 开始，需要和康为确认是否有 basename 设置
    : (component
      ? file
      : `${file}?main&basename=${basename}`);

  // 构造导入 App 变量
  // parse 时需要的参数配置
  const parserConfig = {
    sourceType: 'module',
    plugins: [
      'typescript',
    ],
  };
  const ast = parse(source, parserConfig);

  injectImportApp(ast, entry, parserConfig);

  // 插入 uxcore 相关信息
  ast.program.body.push(template(`
  /* below generated by recore. You can ignore. */
  window['RECORE_KEY'] = RECORE_VALUE
  `, Object.assign({
    preserveComments: true,
  }, parserConfig))({
    RECORE_KEY: t.stringLiteral('__RECORE__'),
    RECORE_VALUE: t.identifier('__RECORE__'),
  }));

  if (spmA && domain) {
    // 将信息写入共享内存
    sharedBoot.write({ spmA, domain });

    // 将 SPM AST 插入到最后一句 import 的后面
    const spmFuncAst = generateSpmFuncAst(spmA);
    const LastImportDeclarationIndex = ast.program.body
      .map(item => item.type)
      .reverse()
      .findIndex(item => item === 'ImportDeclaration');
    ast.program.body = [
      ...ast.program.body.slice(0, LastImportDeclarationIndex),
      spmFuncAst[1],
      ...ast.program.body.slice(LastImportDeclarationIndex),
    ];
  }

  ast.program.body.unshift(template('import "PUBLIC_PATH";', parserConfig)({
    PUBLIC_PATH: t.stringLiteral('@ali/nowa-recore-solution/src/recore-public-path'),
  }));

  const { code, map } = generate(ast, { sourceMaps: true, sourceFileName: resourcePath });

  callback(null, code, map);
};
