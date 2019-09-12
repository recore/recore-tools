/* eslint-disable */
const babelTraverse = require('@babel/traverse');
const template = require('@babel/template').default;

const traverse = babelTraverse.default;
const { Scope } = babelTraverse;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const parser = require('vx-ast-parser');
const { hasOwnProperty } = require('../../lib/util');

const {
  S_ACTION,
  S_SCOPE,
  S_AREA,
  S_GETTER,
  S_SETTER,
  S_VIEW_GETTER,
  S_EVENT,
  buildStyleDisplayNode,
  buildFlowNode,
  buildDefaultFlowNode,
  buildSingleFlowNode,
  buildExprNode,
  buildFlows,
  buildArea,
  buildLoop,
  buildDelegate,
  buildProps,
  buildAreaRender,
  buildView,
  buildAction,
  buildRouterViewNode,
  buildViewRender,
  buildPortalView,
} = require('./builders');

const DIRECTIVES_RESERVED = {
  'x-for': null,
  'x-if': null,
  'x-else-if': null,
  'x-else': null,
  'x-show': null,
  'x-model': null,

  /**
   * 0 stands for no expression for the directive value
   */
  'x-each': 0,
  'x-slot': 0,
  'x-area': 0,
  'x-title': 0,
  'x-ignore': 0,
  'x-id': 0,
};

const DIRECTIVES_DEFAULTS = {
  'x-area': true,
  'x-ignore': true,
};

const namespaces = {};
function generateSymbol(ns) {
  if (!hasOwnProperty(namespaces, ns)) {
    namespaces[ns] = 1;
  } else {
    namespaces[ns]++;
  }

  return `${ns}${namespaces[ns].toString(36)}`;
}

function raise(node, message) {
  const loc = node.loc.start;
  const msg = `${message} (${loc.line}:${loc.column})`;
  const err = new SyntaxError(msg);
  err.loc = loc;
  throw err;
}

const origAddGlobal = Scope.prototype.addGlobal;
Scope.prototype.addGlobal = function addGlobal(node) {
  origAddGlobal.call(this, node);
  if (!this.xglobals) {
    this.xglobals = [];
  }
  this.xglobals.push(node);
};

function isGlobalScope(scope) {
  if (types.isProgram(scope.block)) {
    return true;
  }

  if (types.isArrowFunctionExpression(scope.block)) {
    return isGlobalScope(scope.parent);
  }

  return false;
}

function getAST(contents) {
  contents = (contents || '') + '<!--end-->';

  const plugins = [
    'jsx',
    'optionalChaining',
    ['decorators', { decoratorsBeforeExport: true }],
    'objectRestSpread',
    ['pipelineOperator', { proposal: 'minimal' }],
  ];

  return parser.parse(contents, {
    jsxTopLevel: true,
    plugins,
  });
}

function getExprAST(code) {
  if (!code) {
    return null;
  }

  const plugins = [
    'optionalChaining',
    ['decorators', { decoratorsBeforeExport: true }],
    'objectRestSpread',
    ['pipelineOperator', { proposal: 'minimal' }],
  ];

  return parser.parseExpression(code, {
    plugins,
  });
}

function isGlobalScope(scope) {
  if (types.isProgram(scope.block)) {
    return true;
  }

  if (types.isArrowFunctionExpression(scope.block)) {
    return isGlobalScope(scope.parent);
  }

  return false;
}

function cutOperator(operator) {
  return operator.substr(0, operator.length - 1);
}

function replaceWithScope(path, property, computed) {
  if (property.name === S_ACTION) {
    path.replaceWith(types.memberExpression(
      types.identifier(S_SCOPE),
      types.identifier(S_ACTION),
    ));
    path.skip();
  } else if (property.name === S_VIEW_GETTER) {
    path.replaceWith(types.memberExpression(
      types.identifier(S_SCOPE),
      types.identifier(S_VIEW_GETTER),
    ));
    path.skip();
  } else if (types.isAssignmentExpression(path.parent) && path.key === 'left') {
    let right = path.parent.right;
    if (path.parent.operator !== '=') {
      right = types.binaryExpression(cutOperator(path.parent.operator), types.callExpression(
        types.memberExpression(
          types.identifier(S_SCOPE),
          types.identifier(S_GETTER),
        ),
        [
          computed ? property : types.stringLiteral(property.name),
        ],
      ), right);
    }
    path.parentPath.replaceWith(types.callExpression(
      types.memberExpression(
        types.identifier(S_SCOPE),
        types.identifier(S_SETTER),
      ),
      [
        computed ? property : types.stringLiteral(property.name),
        right,
      ],
    ));
    path.parentPath.skip();
  } else if (types.isUpdateExpression(path.parent)) {
    raise(path.parent, 'Self update expression not allowed in VisionX');
  } else {
    path.replaceWith(types.callExpression(
      types.memberExpression(
        types.identifier(S_SCOPE),
        types.identifier(S_GETTER),
      ),
      [computed ? property : types.stringLiteral(property.name)],
    ));
    path.skip();
  }
}

function parseExpression(ast, bindings) {
  let globals;
  ast = types.returnStatement(ast);

  function isGlobal(node) {
    return globals && globals.indexOf(node) > -1;
  }

  function isBinding(name) {
    return hasOwnProperty(bindings, name);
  }

  traverse({
    type: 'File',
    program: {
      type: 'Program',
      body: [ast],
    },
  }, {
    enter(path) {
      if (path.isProgram()) {
        globals = path.scope.xglobals || [];
      } else if (path.isThisExpression()) {
        if (isGlobalScope(path.scope)) {
          if (types.isMemberExpression(path.parent)) {
            replaceWithScope(path.parentPath, path.parent.property, path.parent.computed);
          } else {
            path.replaceWith(types.identifier(S_SCOPE));
            path.skip();
          }
        }
      } else if (path.isIdentifier()) {
        const name = path.node.name;
        if (isGlobal(path.node) && name !== S_SCOPE && name !== S_AREA && name !== 'window' && !isBinding(name)) {
          replaceWithScope(path, types.identifier(name), false);
        }
      } else if (path.isJSXElement() || path.isJSXFragment()) {
        const bindings = path.scope.getAllBindings();
        path.replaceWith(transformJSXExpression(path.node, bindings));
        path.skip();
      }
    },
  });

  return ast.argument;
}

function getJSXIdentifier(nameAST) {
  return generate(nameAST).code;
}

function filterContent(str) {
  const lines = str.split(/\r\n|\n|\r/);
  let lastNonEmptyLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i;
    }
  }
  str = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const isFirstLine = i === 0;
    const isLastLine = i === lines.length - 1;
    const isLastNonEmptyLine = i === lastNonEmptyLine;

    // replace rendered whitespace tabs with spaces
    let trimmedLine = line.replace(/\t/g, ' ');

    // trim whitespace touching a newline
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, '');
    }

    // trim whitespace touching an endline
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, '');
    }

    if (trimmedLine) {
      if (!isLastNonEmptyLine) {
        trimmedLine += ' ';
      }

      str += trimmedLine;
    }
  }
  return str;
}

function toAssignment(left, right) {
  // for ({}).identifier, new Xxxx.ccc, but not recommended!
  if (types.isMemberExpression(left)) {
    return types.assignmentExpression('=', left, right);
  }

  if (types.isCallExpression(left)
    && left.callee.object.name === S_SCOPE && left.callee.property.name === S_GETTER
  ) {
    const ret = types.cloneNode(left);
    ret.callee.property.name = S_SETTER;
    ret.arguments.push(right);
    return ret;
  }

  raise(left, 'Expression is not LVal, cannot convert to assignment');
  return null;
}

function getTagName(elementAST) {
  if (types.isJSXFragment(elementAST)) {
    return 'Fragment';
  }
  const typeName = getJSXIdentifier(elementAST.openingElement.name);

  if (typeName === 'block') {
    return 'Fragment';
  }

  return typeName;
}

function transformJSXExpression(elementAST, bindings) {
  const context = transformJSXElement(elementAST, bindings, true, true);

  const { directives, node } = context;

  if (directives['x-if']) {
    // ${S_AREA}.area(null, (${S_AREA}) => ${S_AREA}.expr(null, (${S_SCOPE}) => condition) ? node : null)
    return buildArea({
      AID: types.nullLiteral(),
      NODE: buildSingleFlowNode({
        TEST: buildExprNode({
          ID: types.nullLiteral(),
          EXPR: directives['x-if'].ast,
        }),
        NODE: node,
      }),
    });
  }

  return node;
}

function transformAction(exprAst, reportError, disableArray = false) {
  if (types.isStringLiteral(exprAst)) {
    try {
      exprAst = getExprAST(exprAst.value);
    } catch (e) {
      reportError();
    }
  }

  // () => expr / function(){} , ignore
  if (types.isFunction(exprAst)) {
    return exprAst;
  }

  // xxx.xxx => (...rest) => xxx.xxx(...rest)
  if (types.isMemberExpression(exprAst) || types.isIdentifier(exprAst)) {
    return types.arrowFunctionExpression([
      types.restElement(types.identifier('x'))
    ], types.callExpression(
      exprAst,
      [types.spreadElement(types.identifier('x'))]
    ));
  }

  if (types.isCallExpression(exprAst) && types.isMemberExpression(exprAst.callee) && exprAst.callee.property.name === 'bind') {
    return exprAst;
  }

  // foreach convert
  if (!disableArray && types.isArrayExpression(exprAst)) {
    exprAst.elements = exprAst.elements.map((item) => {
      return transformAction(item, reportError, true);
    });
    return exprAst;
  }

  // others: should be call expression or statement
  return types.arrowFunctionExpression([types.identifier(S_EVENT)], exprAst);
}

function parseAttributes(attrAST, bindings) {
  const attributes = [];
  const directives = {};

  attrAST.forEach((attr) => {
    const config = {};
    config.node = attr;
    if (types.isJSXSpreadAttribute(attr)) {
      config.ast = parseExpression(attr.argument, bindings);
      config.spread = true;
      attributes.push(config);
      return;
    }

    let name = getJSXIdentifier(attr.name);

    if (name[0] === '@') {
      const mi = name.indexOf('.');
      let modifiers = '';
      if (mi > 1) {
        modifiers = name.substring(mi + 1);
        name = name.substring(0, mi);
      }
      name = `on${name.substr(1, 1).toUpperCase()}${name.substr(2)}`;

      config.name = name;
      let exprAst;
      if (attr.value && types.isJSXExpressionContainer(attr.value)) {
        exprAst = attr.value.expression;
      } else if (types.isStringLiteral(attr.value)) {
        exprAst = attr.value;
        if (!exprAst.value) {
          exprAst = types.identifier(name);
        }
      } else {
        // not reach here...
        return;
      }

      exprAst = transformAction(exprAst, () => {
        raise(attr.value, 'Action binding should be a valid expression');
      });

      const action = parseExpression(exprAst, bindings);

      config.ast = buildAction({
        ACTION: action,
        MODIFIERS: modifiers ? types.stringLiteral(modifiers) : null
      });

      attributes.push(config);
      return;
    }

    if (name[0] === '#') {
      config.value = name.substr(1);
      config.name = 'x-id';
      directives[config.name] = config;
      return;
    }

    const isDirective = hasOwnProperty(DIRECTIVES_RESERVED, name);

    if (isDirective && hasOwnProperty(directives, name)) {
      raise(attr, `Duplicated directive "${name}"`);
    }

    config.name = name;
    // normal property
    if (!attr.value) {
      config.ast = types.booleanLiteral(true);
      config.value = true;
    } else {
      const expr = types.isJSXExpressionContainer(attr.value) ? attr.value.expression : attr.value;
      if (types.isJSXEmptyExpression(expr)) {
        raise(attr.value, `Cannot use empty expression for prop "${name}"`);
      }
      if (DIRECTIVES_RESERVED[name] === 0) {
        if (types.isNumericLiteral(expr) || types.isStringLiteral(expr)) {
          config.value = expr.value;
        } else {
          // can not be computed expression
          raise(attr.value, `Cannot use expression for prop "${name}"`);
        }
      } else {
        config.ast = name === 'x-for' ? expr : parseExpression(expr, bindings);
      }
    }

    if (isDirective) {
      directives[config.name] = config;
    } else {
      attributes.push(config);
    }
  });

  if (directives['x-model']) {
    const xModel = directives['x-model'];
    if (types.isStringLiteral(xModel.ast)) {
      try {
        const exprAst = getExprAST(xModel.ast.value);
        xModel.ast = parseExpression(exprAst, bindings);
      } catch (e) {
        raise(xModel.node, 'x-model binding shoule be a valid Lval expression');
      }
    }

    if (xModel.ast) {
      const mGetter = types.arrowFunctionExpression([], xModel.ast);
      const mSetter = types.arrowFunctionExpression(
        [types.identifier('v')],
        toAssignment(xModel.ast, types.identifier('v')),
      );
      attributes.push({
        name: 'x-model',
        ast: types.arrayExpression([mGetter, mSetter]),
      });
    }
  }

  if (directives['x-show']) {
    attributes.push({
      name: 'style.display',
      ast: buildStyleDisplayNode({
        TEST: directives['x-show'].ast
      }),
    });
  }

  return {
    attributes,
    directives
  };
}

function transformJSXChildren(childrenAST, bindings, inExpression = false) {
  const children = [];
  const branches = [];
  const slots = [];

  function addChild(node) {
    children.push(node);
  }

  function addSlot(property) {
    slots.push(property);
  }

  function addBranch(branch) {
    if (branch.directives['x-if']) {
      completeBranches();
    }
    branches.push(branch);
    if (branch.directives['x-else']) {
      completeBranches();
    }
  }

  function completeBranches() {
    if (branches.length < 1) return;
    let branch;
    let directives;
    let directive;
    let i = branches.length - 1;
    if (i === 0) {
      branch = branches.pop();
      directives = branch.directives;
      directive = directives['x-else'] || directives['x-if'] || directives['x-else-if'];
      if (directive.name === 'x-else') {
        addChild(branch.node);
      } else {
        addChild(buildSingleFlowNode({
          TEST: buildExprNode({
            ID: inExpression ? types.nullLiteral() : types.stringLiteral(generateSymbol('e')),
            EXPR: directive.ast,
          }),
          NODE: branch.node,
        }));
      }
      return;
    }


    const flows = [];
    const flowId = generateSymbol('f');
    while (branch = branches.pop()) {
      directives = branch.directives;
      directive = directives['x-else'] || directives['x-if'] || directives['x-else-if'];
      if (directive.name === 'x-else') {
        flows.unshift(buildDefaultFlowNode({
          NODE: branch.node,
        }));
      } else {
        flows.unshift(buildFlowNode({
          TEST: buildExprNode({
            ID: inExpression ? types.nullLiteral() : types.stringLiteral(`${flowId}/${i}`),
            EXPR: directive.ast,
          }),
          NODE: branch.node,
        }));
      }
      i--;
    }

    addChild(buildFlows({
      FLOWS: types.arrayExpression(flows),
    }));
  }

  for (let i = 0, l = childrenAST.length; i < l; i++) {
    let child = childrenAST[i];

    if (types.isJSXText(child)) {
      const content = filterContent(child.value);
      if (content) {
        completeBranches();
        addChild(types.stringLiteral(content));
      }
      continue;
    }

    if (types.isJSXExpressionContainer(child)) {
      if (types.isJSXElement(child.expression) || types.isJSXFragment(child.expression)) {
        child = child.expression;
      } else {
        completeBranches();
        if (!types.isJSXEmptyExpression(child.expression)) {
          if (types.isLiteral(child.expression)) {
            addChild(child.expression);
          } else {
            addChild(buildExprNode({
              ID: inExpression ? types.nullLiteral() : types.stringLiteral(generateSymbol('e')),
              EXPR: parseExpression(child.expression, bindings),
            }));
          }
        }
        continue;
      }
    }

    if (types.isJSXElement(child) || types.isJSXFragment(child)) {
      const context = transformJSXElement(child, bindings, false, inExpression);
      const { directives } = context;

      if (directives['x-ignore'] && directives['x-ignore'].value) {
        continue;
      }

      if (directives['x-if'] || directives['x-else-if'] || directives['x-else']) {
        addBranch(context);
        continue;
      }

      completeBranches();
      if (directives['x-slot']) {
        const key = directives['x-slot'].value;
        if (key !== true) {
          slots.push(types.objectProperty(types.stringLiteral(key), context.node));
        }
      } else {
        addChild(context.node);
      }
      continue;
    }
  }

  completeBranches();

  return { children, slots };
}

function transformJSXElement(elementAST, bindings = null, forceArea = false, inExpression = false) {
  const tagName = getTagName(elementAST);
  const context = elementAST.openingElement
    ? parseAttributes(elementAST.openingElement.attributes, bindings) : { directives: {}, attributes: [] };

  const { directives, attributes } = context;

  if (directives['x-ignore'] && directives['x-ignore'].value) {
    return { directives };
  }

  let areaid = null;
  if (directives['x-area']) {
    forceArea = true;
    areaid = directives['x-area'].value;
    if (areaid === true || !areaid) {
      areaid = generateSymbol('a');
    } else {
      areaid = String(areaid);
    }
  } else if (forceArea) {
    areaid = generateSymbol('a');
  }

  let vid = null;
  if (directives['x-id']) {
    vid = directives['x-id'].value;
    if (vid === true || !vid) {
      vid = generateSymbol('v');
    } else {
      vid = String(vid);
    }
  } else {
    vid = generateSymbol('v');
  }

  let getProps = null;
  let getChildren = null;
  let getSlots = null;

  if (attributes && attributes.length > 0) {
    getProps = buildProps({
      PROPS: types.arrayExpression(attributes.map(config => {
        return types.arrayExpression([config.spread ? types.nullLiteral() : types.stringLiteral(config.name), config.ast]);
      })),
    });
  }

  const isRouterView = tagName === 'RouterView' || tagName === 'RouterOutlet';
  if (isRouterView) {
    context.node = buildRouterViewNode({
      VID: types.stringLiteral(vid),
      PROPS: getProps
    });
    return context;
  }

  const { children, slots } = transformJSXChildren(elementAST.children, bindings, inExpression);

  if (children.length > 0) {
    getChildren = buildAreaRender({
      VIEW: types.arrayExpression(children),
    });
  }
  if (slots.length > 0) {
    getSlots = buildAreaRender({
      VIEW: types.objectExpression(slots),
    });
  }

  const ID = inExpression ? types.stringLiteral(tagName) : types.stringLiteral(`${tagName}#${vid}`);
  let node = buildView({
    ID,
    PROPS: getProps,
    CHILDREN: getChildren,
    SLOTS: getSlots,
  });

  if (directives['x-for']) {
    if (directives['x-if']) {
      node = buildSingleFlowNode({
        TEST: buildExprNode({
          ID: inExpression ? types.nullLiteral() : generateSymbol('e'),
          EXPR: directives['x-if'].ast,
        }),
        NODE: node,
      });
      delete directives['x-if'];
    }
    const [DATA, ITEM, INDEX] = parseFor(directives['x-for'], directives['x-each']);
    const AID = types.stringLiteral(areaid || generateSymbol('loop'));
    node = buildLoop({
      AID,
      DATA: buildExprNode({
        ID: types.stringLiteral(generateSymbol('e')),
        EXPR: parseExpression(DATA, bindings),
      }),
      DELEGATE: buildDelegate({
        ITEM,
        INDEX,
        NODE: node,
      }),
      VIRTUAL: !forceArea,
    });
  } else if (forceArea && !inExpression) {
    node = buildView({
      ID: types.stringLiteral(`@${areaid}:${tagName}#${vid}`),
      PROPS: getProps,
      CHILDREN: getChildren,
      SLOTS: getSlots,
    });
    /*
    node = buildArea({
      AID: inExpression ? types.nullLiteral() : types.stringLiteral(areaid),
      NODE: node,
    });
    */
  }
  context.node = node;

  return context;
}

function isEachExpression(ast) {
  return types.isBinaryExpression(ast) && (ast.operator === 'of' || ast.operator === 'in');
}

function getNameLiteral(ast) {
  if (!ast) {
    return;
  }
  if (types.isStringLiteral(ast)) {
    return ast.value;
  }
  if (types.isIdentifier(ast)) {
    return ast.name;
  }
  return;
}

function parseEach(ast) {
  const defaults = [types.stringLiteral('item'), types.stringLiteral('index')];
  if (!ast) {
    return defaults;
  }
  let a;
  let b;
  if (types.isStringLiteral(ast)) {
    const m = /^(\w+)?(?: *, *(\w+))?/.exec(ast.value);
    if (m) {
      if (m[1]) {
        a = m[1];
      }
      if (m[2]) {
        b = m[2];
      }
    }
  } else if (types.isIdentifier(ast)) {
    a = ast.name;
  } else if (types.isSequenceExpression(ast)) {
    a = getNameLiteral(ast.expressions[0]);
    b = getNameLiteral(ast.expressions[1]);
  } else if (types.isArrayExpression(ast)) {
    a = getNameLiteral(ast.elements[0]);
    b = getNameLiteral(ast.elements[1]);
  } else {
    // TODO: return a lint error
  }
  if (a) {
    defaults[0] = types.stringLiteral(a);
  }
  if (b) {
    defaults[1] = types.stringLiteral(b);
  }
  return defaults;
}

function parseFor(xfor, xeach) {
  if (types.isSequenceExpression(xfor.ast) && isEachExpression(xfor.ast.expressions.slice(-1))) {
    const seq = types.cloneDeep(xfor.ast);
    const last = seq.expressions.pop();
    seq.expressions.push(last.right);
    return [seq, ...parseEach(last.left)];
  }

  if (isEachExpression(xfor.ast)) {
    return [xfor.ast.right, ...parseEach(xfor.ast.left)];
  }

  return [xfor.ast, ...parseEach(xeach ? types.stringLiteral(xeach.value) : null)];
}

function transform(source) {
  const ast = getAST(source);

  if (!ast) {
    return buildViewRender({
      VIEW: types.nullLiteral(),
    });
  }

  const { children } = transformJSXChildren(ast.program.body);

  if (children.length < 1) {
    return buildViewRender({
      VIEW: types.nullLiteral(),
    });
  }

  return buildViewRender({
    VIEW: buildPortalView({
      VIEW: types.arrayExpression(children),
    }),
  });

  // toCode
}

module.exports = transform;
