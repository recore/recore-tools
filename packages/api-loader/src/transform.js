const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const packageName = require('../package.json').name;
const solutions = require('./solutions');
const log = require('./log');

function transform(ast, autoMock, isSubmodule) {
  const usedSolutions = {};
  let usedCustom = false; // 存在未定义的 @kind 时使用 custom
  const hasDeclareClz = !!_.find(ast.clzes, clz => clz.modifiers.includes('declare'));
  let imports = [];
  const variables = [];
  const body = [];
  let defaultExport = '';

  ast.statements.forEach(statement => {
    switch(statement.type) {
      case 'class': {
        const clz = statement.statement;
        const mockClzName = _.get(clz.name.match(/(\w+)Mock$/), '1');
        if (mockClzName && !autoMock && !!_.find(ast.statements, st => st.statement.name === mockClzName)) {
          break;
        }
        if (clz.modifiers.includes('declare')) {
          const hasMockClz = !!_.find(ast.statements, st => st.statement.name === clz.name + 'Mock');
          // declare class should be remained?
          // body.push(renameDeclareClassName(clz));
          body.push(makeImplementClz(clz, hasMockClz, autoMock, usedSolutions));
        } else {
          body.push(statement.statement.__text__.trim());
        }
        break;
      }
      case 'func': case 'variable': {
        const typeDef = _.find(ast.types, {'name': statement.name});
        if (typeDef) {
          typeDef.hasDataCheck = true;
          variables.push(renameTypeCheckName(statement.statement));
        } else {
          body.push(statement.statement.__text__.trim());
        }
        break;
      }
      case 'import': {
        imports.push(statement.statement.__text__.trim());
        break;
      }
      case 'default': {
        defaultExport = statement.statement.__text__.trim();
        break;
      }
      default: {
        body.push(statement.statement.__text__.trim());
      }
    }
  })

  const usedSolutionKeys = _.keys(usedSolutions);
  const importDeclare = solutions.genImportDeclare(usedSolutionKeys, ast.fileName, autoMock);
  imports = [].concat(importDeclare.imports, imports);
  if (usedSolutions._custom) {
    imports.push(`import api_kind_custom from '@ali/api-loader/src/middleware/basic/custom'`);
  }

  if (usedSolutionKeys.length || usedSolutions._custom) {
    const mws = (usedSolutions.custom ? ['api_kind_custom'] : []).concat(importDeclare.mws);
    variables.push(`const _requestHandles: any = { ${mws.join(', ')} };`);
  }

  const combined = [].concat(imports, '\n', variables, '\n', body, '\n', makeTypeDeclare(ast.types), '\n', makeModule(ast.subAst), '\n', defaultExport);
  return combined.join('\n').replace(/\n{2,}/g, '\n\n').replace(/^\n+/, '');
}

function renameDeclareClassName(clz) {
  return clz.__text__.insert(clz.nameStart+1, 'I');
}

function renameTypeCheckName(func) {
  return func.__text__.insert(func.nameStart + func.name.length, '_Rule').trim();
}

function makeImplementClz(clz, hasMockClz, autoMock, usedSolutions) {
  const hasCustomMock = autoMock && hasMockClz;
  return `
${clz.__isExport__ ? 'export ': ''}class ${clz.name} {
  ${!hasCustomMock ? '' : `customMock = new ${clz.name}Mock();`}
  ${clz.methods.map(method => {
    const config = Object.assign({ kind: 'ajax', }, clz.config, method.config);
    if (!autoMock) {
      delete config.mock;
    }
    const argsStr = Object.keys(method.args).join(', ');
    const mockPipe = autoMock ? _.get(solutions.solutions, config.kind + '.mock', []) : [];
    let pipe = _.get(solutions.solutions, config.kind + '.pipe');
    if (pipe) {
      usedSolutions[config.kind] = true;
    } else {
      pipe = [];
      usedSolutions._custom = true;
    }
    return `  ${method.__fulltext__.replace(/;$/, '')} {
    const _param = {${argsStr}};
    const _paramRule: any = ${type2Code(method.args)};
    const _returnRule: any = ${type2Code(method.returnType)};
    const _config: any = ${JSON.stringify(config)};
    const _callee = '${clz.name}.${method.name}';
    const _mwArgs = { param: _param, config: _config, paramRule: _paramRule, returnRule: _returnRule, callee: _callee, instance: this };
    ${!mockPipe.length ? '' : `if (window.__mock__ || _config.mock) {
      ${makePromisePipe(mockPipe, 3)}
    }`}
    ${pipe.length ? makePromisePipe(pipe, 1) : `return _requestHandles.api_kind_custom(_mwArgs, _param);`}
  }\n`;
  }).join('')}
}
`;
}

function makePromisePipe(pipe, indentOffset) {
  const wrap = (i) => `${indent(i+1, indentOffset)}Promise.resolve(_requestHandles.${pipe[i].name}(_mwArgs, ${i > 0 ? `r${i-1}` : '_param'})).then((r${i}: any) => {
    ${i < pipe.length-1 ? wrap(i+1) : `${indent(i+2, indentOffset)}resolve(r${i});`}
    ${indent(i+1, indentOffset)}}).catch((e: any) => {
      ${indent(i+1, indentOffset)}reject({e, step: '${pipe[i].name}', data: ${i > 0 ? `r${i-1}` : '_param'}});
    ${indent(i+1, indentOffset)}})`;
  return `return new Promise((resolve, reject) => {
    ${wrap(0)}
    ${indent(0, indentOffset)}})`;
}

function makeTypeDeclare(typeDefineds) {
  return _.map(typeDefineds, def => {
    const prefix = def.value.__isExport__ ? 'export ' : '';
    if (def.hasDataCheck) {
      return `${prefix}const ${def.name}:any = ${def.name}_Rule;\n${def.name}.__type__ = ${type2Code(def.value, 2)}`
    } else {
      return `${prefix}const ${def.name} = ${type2Code(def.value, 2)};`
    }
  }).join('\n');
}

function makeModule(mod) {
  return mod.map(subAst => {
    const moduleDef = {};
    subAst.statements.forEach(st => {
      if (st.statement.__type__) {
        moduleDef[st.statement.__name__] = "#" + st.statement.__type__ + "#";
      } else {
        moduleDef[st.statement.__name__] = st.statement;
      }
    });
    return `const ${subAst.name} = ${type2Code(moduleDef, 2)}`
  }).join('\n');
}

function type2Code(typedef, tab) {
  return JSON.stringify(
    typedef,
    function(key, value) {
      if (key === '__isExport__' || value === undefined) {
        return undefined;
      }
      if (typeof value === 'function') {
        return "#" + value.name + "#";
      }
      if ((key === '__type__' || key === '__rule__') && typeof value !== 'object') {
        return "#" + value + "#";
      }
      return value;
    },
    tab
  )
    .replace(/\"#/g, '')
    .replace(/#\"/g, '')
    .replace(/\\\\/g, '\\');
}

String.prototype.insert = function(index, value) {
  return this.slice(0, index) + value + this.slice(index);
}
const indent = (n, offset) => new Array(n*2+offset).join(' ') ;

module.exports = transform;
