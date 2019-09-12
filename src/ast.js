const ts = require("typescript");
const fs = require("fs");
const path = require('path');
const _ = require('lodash');

const SyntaxKind = ts.SyntaxKind;

const syntax = {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
};

function getKindStr(kind, defaul, node) {
  if (kind === SyntaxKind.ArrayType) {
    kind = node.type.elementType.kind;
    node = node.type.elementType;
  }
  if (kind === SyntaxKind.TypeReference) {
    // 单值; 数组
    const typeName = node.typeName || node.type.typeName;
    if (typeName.kind === SyntaxKind.QualifiedName) {
      return typeName.left.getText() + '.' + typeName.right.getText();
    }
    return _.get(node, 'type.typeName.text') || _.get(node, 'typeName.text');
  }
  if (kind === SyntaxKind.AnyKeyword) {
    return 'Object';
  }
  return _.get(SyntaxKind[kind].match(/(\w+)Keyword/), 1, defaul);
}

/** 
 * type alias 和 interface 是嵌套类型, 其他是简单类型, 
 * @returns true | undefined(undefined可以让字段隐藏掉,false会保留字段)
 */
function isSimpleType(node) {
  let kind = node.kind || node.type.kind;
  if (kind === SyntaxKind.ArrayType) {
    kind = node.type.elementType.kind;
  }
  return _.includes([SyntaxKind.TypeReference, SyntaxKind.InterfaceDeclaration]) || undefined;
}

function isExport(node) {
  return ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export
}

function hideProperty(key, obj) {
  Object.defineProperty(obj, key, {enumerable: false});
  return obj;
}

function setOrPush(obj, k, v) {
  if (obj[k]) {
    obj[k] = [].concat(obj[k], v);
  } else {
    obj[k] = v;
  }
}

const hideText = hideProperty.bind(undefined, '__text__');

function str2Rule(str, type) {
  str = (str || '').trim();
  if (!str) {
    return {};
  }
  const parts = str.match(/`(.+)`(.+)/) || [undefined, undefined, str];
  return {
    rule: parts[1],
    comment: parts[2] ? parts[2].trim() : undefined,
  }
}

function visitLiteral(t, v) {
  let __type__;
  let __literal__;
  switch(t.type ? t.type.literal.kind : t.literal.kind) {
    case SyntaxKind.NumericLiteral: {
      __type__ = Number(v);
      __literal__ = true;
      break;
    }
    case SyntaxKind.TrueKeyword: case SyntaxKind.FalseKeyword: {
      __type__ = v === 'true';
      __literal__ = true;
      break;
    }
    case SyntaxKind.StringLiteral: default: {
      __type__ = v;
      __literal__ = true;
      break;
    }
  }
  return {
    __type__,
    __literal__,
    __simple__: __literal__ || isSimpleType({type: t}),
  };
}

function visitEnum(arg) {
  if (arg.type.kind !== SyntaxKind.UnionType) {
    return;
  }
  const types = {};
  types[SyntaxKind.StringKeyword] = String;
  types[SyntaxKind.NumberKeyword] = Number;
  types[SyntaxKind.BooleanKeyword] = Boolean;
  types[SyntaxKind.AnyKeyword] = Object;
  return arg.type.types.map(function(t){
    const v = t.getText();
    let __type__;
    let __literal__;
    if (t.kind === SyntaxKind.TypeReference) {
      __type__ = v;
    } else if (!t.literal || !t.literal.kind) {
      __type__ = types[t.kind];
    } else {
      return visitLiteral(t, v);
    }
    return {
      __type__,
      __literal__,
      __simple__: __literal__ || isSimpleType({type: t}),
    };
  });
}

function visitModule(node, ctx) {
  const subModule = ctx.createSub(node.name.text);
  node.symbol.exports.forEach((symbol) => visitNode(symbol.declarations[0], subModule));
  return subModule;
}

function visitNode(node, ctx) {
  let type = 'other';
  let statement = {
    __text__: node.getFullText()
  };
  switch(node.kind) {
    case SyntaxKind.InterfaceDeclaration: {
      statement = visitInterface(node, ctx);
      ctx.types.push({ name: node.name.text, value: statement });
      type = 'type';
      break;
    }
    case SyntaxKind.TypeAliasDeclaration: {
      statement = visitType(node, ctx);
      ctx.types.push({ name: node.name.text, value: statement });
      type = 'type';
      break;
    }
    case SyntaxKind.ClassDeclaration: {
      statement = visitClass(node, ctx);
      ctx.clzes.push(statement);
      type = 'class';
      break;
    }
    case SyntaxKind.FunctionDeclaration: {
      statement = visitFunc(node);
      type = 'func';
      break;
    }
    case SyntaxKind.VariableStatement: {
      statement = visitVariables(node);
      type = 'variable';
      break;
    }
    case SyntaxKind.ImportDeclaration: {
      type = 'import';
      break;
    }
    case SyntaxKind.ModuleDeclaration: {
      statement = visitModule(node, ctx);
      statement.__text__= node.getFullText();
      ctx.modules.push(statement);
      type = 'module';
      break;
    }
    case SyntaxKind.ExportAssignment: {
      type = 'default';
      break;
    }
  }
  statement.__isExport__ = isExport(node);
  ctx.statements.push({type, statement, name: statement.name || (node.name && node.name.text) });
}

function visitFunc(node) {
  return {
    __text__: node.getText(),
    name: node.name.text,
    nameStart: node.name.getStart() - node.getStart(),
  }
}

function visitVariables(node) {
  const delaration = node.declarationList.declarations[0];
  return {
    __text__: 'const ' + delaration.getText(),
    name: delaration.name.text,
    nameStart: 6,
  }
}

function visitInterface(node, ctx) {
  const typeDeclare = {};
  for (const child of node.members) {
    typeDeclare[child.name.text] = visitType(child, ctx);
  }
  typeDeclare.__text__ = node.getFullText();
  typeDeclare.__name__ = node.name ? node.name.getText() : undefined;
  return hideText(typeDeclare);
}

function visitType(node, ctx, inlineType) {
  if (!node.type) {
    return;
  }
  if (inlineType) {
    node = {
      type: node.type.typeArguments[0],
      symbol: node.type.typeArguments[0],
      getFullText: node.type.typeArguments[0].getFullText.bind(node.type.typeArguments[0]),
      questionToken: node.questionToken,
    }
  }
  const members = node.type.members || _.get(node, 'type.elementType.members');
  if (members) {
    const typeDeclare = {};
    for (const child of members) {
      typeDeclare[child.name.text] = visitType(child, ctx);
    }
    typeDeclare.__text__ = node.getFullText();
    typeDeclare.__optional__ = !!node.questionToken || undefined;
    typeDeclare.__array__ = node.type.kind === SyntaxKind.ArrayType || undefined;
    typeDeclare.__name__ = node.name ? node.name.getText() : undefined;
    return hideText(typeDeclare);
  } else if (SyntaxKind.LiteralType === node.type.kind) {
    return visitLiteral(node, node.type.literal.getText());
  } else{
    const isSimple = isSimpleType(node);
    const type = getKindStr(node.type.kind, node.type.kind, node);
    const ruleComment = isSimple ? str2Rule(_.get(_.result(node, 'symbol.getDocumentationComment'), '0.text'), type) : {};
    return hideText({
      __simple__: isSimple,
      __text__: node.getFullText(),
      __optional__: !!node.questionToken || undefined,
      __array__: _.includes([SyntaxKind.TupleType, SyntaxKind.ArrayType], node.type.kind) || undefined,
      __name__: node.name ? node.name.getText() : undefined,
      __comment__: ruleComment.comment,
      __type__: type,
      __rule__: ruleComment.rule,
      __enum__: visitEnum(node),
    })
  }
}

function visitClass (node, ctx) {
  const symbol = node.symbol;
  const extendClz = _.get(node, 'heritageClauses[0].types[0]');
  if (!symbol) return;
  let details = {
    __text__: node.getFullText(),
    name: node.name ? symbol.getName() : '',
    nameStart: node.name.getFullStart() - node.getFullStart(),
    documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
    config: {},
    methods: [],
    heritage: extendClz ? {
      name: extendClz.expression.text,
      start: extendClz.getFullStart() - node.getFullStart(),
      end: extendClz.getEnd() - node.getFullStart(),
    }: undefined,
    modifiers: _.map(node.modifiers, function(mod){
      return mod.getText();
    }),
  };
  symbol.getJsDocTags().forEach(function(t) {
    setOrPush(details.config, t.name, t.text);
  });
  symbol.members.forEach(member => {
    if (member.valueDeclaration.kind !== SyntaxKind.MethodDeclaration) {
      return;
    }
    const paramDesc = {};
    const isReturnPromise = _.get(member, 'valueDeclaration.type.typeName.text') === 'Promise';
    const method = {
      doc: ts.displayPartsToString(member.documentationComment),
      name: member.name,
      args: {},
      config: {},
      body: _.result(member, 'valueDeclaration.body.getFullText'),
      promise: isReturnPromise,
      // TODO simple promise type
      returnType: visitType(member.valueDeclaration, ctx, isReturnPromise),
      nameStart: member.valueDeclaration.name.getStart() - member.valueDeclaration.getFullStart(),
      __text__: member.valueDeclaration.getText(),
      __fulltext__: member.valueDeclaration.getFullText(),
    };
    _.get(member, 'valueDeclaration.jsDoc[0].tags', []).forEach(function(t) {
      if (t.kind === SyntaxKind.JSDocParameterTag) {
        paramDesc[t.name.text] = t.comment;
        return;
      }
      setOrPush(method.config, t.tagName.text, t.comment);
    });
    member.valueDeclaration.parameters.forEach(arg => {
      if (!arg.type) {
        method.args[arg.name.text] = {};
        return;
      }
      const type = getKindStr(arg.type.kind, _.get(arg, 'type.typeName.text'), arg) || arg.type.kind;
      const ruleComment = str2Rule(paramDesc[arg.name.text]);
      method.args[arg.name.text] = {
        __simple__: isSimpleType(arg),
        __optional__: !!arg.questionToken || undefined,
        __array__: arg.type.kind === SyntaxKind.ArrayType || undefined,
        __comment__: ruleComment.comment,
        __type__: type,
        __rule__: ruleComment.rule,
        __enum__: visitEnum(arg),
      }
    }),
    details.methods.push(method);
  });
  return hideText(details);
}

function AST() {
  
  this.clzes = [];
  this.types = [];
  this.modules = [];
  this.statements = [];
  this.fileName;
  this.subAst = [];

  this.fromFile = function(fileName) {
    this.program = ts.createProgram([fileName], syntax);
    const sourceFiles = this.program.getSourceFiles();
    this.sourceFile = sourceFiles.find(function(sourceFile) {
      return fileName === sourceFile.fileName;
    });
    this.fileName = fileName;
    start();
  }

  this.fromCode = function(code, uniqueName) {
    const filePath = this.fileName = uniqueName;
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const options = { strict: true, target: ts.ScriptTarget.Latest, allowJs: true, module: ts.ModuleKind.ES2015 };
    const files = { [filePath]: sourceFile };
    // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler
    const compilerHost = {
      getSourceFile: (fileName, languageVersion, onError) => {
        return files[fileName];
      },
      getDefaultLibFileName: (opts) => "/" + ts.getDefaultLibFileName(opts),
      writeFile: () => { /*pass*/ },
      getCurrentDirectory: () => "/",
      getDirectories: (path) => [],
      fileExists: (fileName) => files[fileName] != null,
      readFile: (fileName) => files[fileName] != null ? files[fileName].getFullText() : undefined,
      getCanonicalFileName: (fileName) => fileName,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      getEnvironmentVariable: () => ""
    };
    this.program = ts.createProgram([...Object.keys(files)], options, compilerHost);
    this.sourceFile = sourceFile;
    start();
  }

  this.createSub = function (name) {
    const sub = new AST();
    sub.fileName = this.fileName;
    sub.program = this.program;
    sub.sourceFile = this.sourceFile;
    sub.checker = this.checker;
    sub.name = name;
    this.subAst.push(sub);
    return sub;
  }

  start = () => {
    this.checker = this.program.getTypeChecker();
    ts.forEachChild(this.sourceFile, (node) => visitNode(node, this));
  }
}

module.exports = AST;
