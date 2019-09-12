const { getOptions } = require('loader-utils');
const babelGenerate = require('@babel/generator').default;
const myFormat = require('my-prettier');
const transform = require('./transform');
const {
  terminalFormatter,
  browserFormatter,
} = require('../../lib/formatter');
const {
  RouterEntryDetector,
  ControllerDetector,
  StyleDetector,
} = require('../../lib/detector');
const logger = require('../../lib/logger');
const { judgeIsVXEntry } = require('../../lib/util');
const { S_AREA } = require('./builders');

function tocode(ast) {
  return babelGenerate(ast, {
    comments: true,
  }).code;
}

function generate(source) {
  this.cacheable();

  const callback = this.async();
  const { resourcePath } = this;
  const options = getOptions(this) || {};

  let tasks = [];
  const addDependency = this.addDependency.bind(this);
  if (options.main || options.entry) {
    // 这里是构建工具需要处理的逻辑（由构建工具生成）
    // 如果是入口，则进入入口文件探测逻辑
    const routerDetector = new RouterEntryDetector({ resourcePath });
    const controllerDetector = new ControllerDetector({ resourcePath });
    const styleDetector = new StyleDetector({ resourcePath });

    tasks = [
      controllerDetector.detect({
        addDependency,
      }),
      routerDetector.detect({
        addDependency,
      }),
      styleDetector.detect({
        addDependency,
      }),
    ];
  } else {
    // 这里处理用户书写的视图文件，查找视图控制器文件
    // 不需要查找路由文件
    // 如：import Menu from '../../components/menu';
    const controllerDetector = new ControllerDetector({ resourcePath, mode: 'same' });
    const styleDetector = new StyleDetector({ resourcePath, mode: 'same' });

    tasks = [
      controllerDetector.detect({
        addDependency,
      }),
      Promise.resolve(null),
      styleDetector.detect({
        addDependency,
      }),
    ];
  }

  Promise.all(tasks).then((result) => {
    const [exactController, exactRouter, exactStyle] = result;

    const codes = [
      "import { compose, xId, xModifiers } from '@recore/fx';",
    ];

    let args = '';
    if (exactController) {
      codes.push(`import Controller from '${exactController}';`);
      args += ', Controller';
    }

    if (exactStyle) {
      codes.push(`import '${exactStyle}';`);
    }

    // 需要存在明确入口以及存在路由才会构造如下代码
    // 排除非入口文件 [index, the-same-filename] 也会查找路由的问题
    if (judgeIsVXEntry(resourcePath) && exactRouter) {
      codes.push(`import routerView from '${exactRouter}?router&basename=${encodeURIComponent(options.basename)}';`);
      args = exactController ? `${args}, routerView` : ', null, routerView';
    }

    codes.push('');

    try {
      codes.push(tocode(transform(source)));
    } catch (err) {
      switch (err.name) {
        case 'SyntaxError': {
          const filename = resourcePath;
          codes.push(`function ViewRender (controller) {
            return controller.$root.render((${S_AREA}) => ${browserFormatter(err, source, filename)})
          }`);
          if (process.env.NODE_ENV !== 'test') {
            logger.error(terminalFormatter(err, source, filename));
          }
          break;
        }

        default: {
          codes.push(`function ViewRender (controller) {
            return controller.$root.render((${S_AREA}) => ${browserFormatter(err, source, resourcePath)})
          }`);
          if (process.env.NODE_ENV !== 'test') {
            logger.error(err);
          }
          break;
        }
      }
    }

    codes.push('ViewRender.compileVersion = 2;');
    codes.push(`export default compose(ViewRender${args});\n`);

    const output = myFormat(codes.join('\n'), 'ctrl');

    callback(null, output);
  }).catch((err) => {
    callback(err);
  });
}

module.exports = generate;
