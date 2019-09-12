const { join } = require('path');
const getVariableName = require('../../lib/get-variable-name');
// const normalizePath = require('../../lib/normalize-path');
const { VXEntryDetector, RouterEntryDetector, FileDetector } = require('../../lib/detector/');
const { judgeIsVXEntry, normalizeRouteMain } = require('../../lib/util');

const varPrefix = 'RR'; // 变量前缀 RecoreRouter

class Codes {
  constructor(routesConfig, resourcePath, addDependency, options) {
    this.routes = (routesConfig.routes || []).filter(item => !item.remote);
    this.baseDir = routesConfig.baseDir || './';
    this.mainPathVariableItems = {};
    this.codes = [];
    this.hooks = routesConfig.hooks;
    delete routesConfig.hooks;
    this.routesConfig = routesConfig;

    const { asEntry, basename } = options;
    this.resourcePath = resourcePath;
    this.addDependency = addDependency;
    this.asEntry = asEntry; // 作为入口，形同 vx
    this.basename = basename; // 路由的 basename
    this.has404 = false; // 是否需要调用 404 标记
  }

  async parseCodes() {
    const {
      baseDir,
      routes,
      mainPathVariableItems,
      resourcePath,
      addDependency,
    } = this;

    for (let i = 0, max = routes.length; i < max; i++) { /* eslint-disable-line */
      const item = routes[i];
      const { name: routeName, redirect } = item;

      if (redirect) {
        continue;
      }

      // route main 路径探测
      const vxDetector = new VXEntryDetector({
        resourcePath,
        baseDir,
        routeMain: item.main,
      });

      const mainPath = await vxDetector.detect({ /* eslint-disable-line */
        addDependency,
      });

      let variableName;
      let importPath;
      let notFound = false;
      if (!mainPath) {
        // 查找对应的目录是否存在 router 文件
        const routerDetector = new RouterEntryDetector({
          resourcePath,
          baseDir,
          routeMain: item.main,
        });
        const routeLocalPath = await routerDetector.detect({/* eslint-disable-line */
          addDependency,
        });
        if (routeLocalPath) {
          // 有对应的路由
          importPath = `${routeLocalPath}?router&asEntry&basename=${this.createBasename(item.path)}`;
          variableName = getVariableName(routeLocalPath);
        } else {
          // 无对应的路由
          // 1. 先看一下是否有明确后缀，如果有的话，就尝试加载
          const fileDetector = new FileDetector({
            resourcePath,
            baseDir,
            routeMain: item.main,
          });
          const filePath = await fileDetector.detect({/* eslint-disable-line */
            addDependency,
          });
          if (filePath) {
            importPath = filePath;
            variableName = getVariableName(filePath);
          } else {
            // 2. 没有，则直接判定为 404
            if (this.has404 !== true) this.has404 = true;
            notFound = true;
          }
        }
      } else {
        const isEntry = judgeIsVXEntry(mainPath, vxDetector.base);
        importPath = isEntry ? `${mainPath}?entry&basename=${this.createBasename(item.path)}` : mainPath;
        variableName = getVariableName(mainPath);
      }

      // 这里以 main 为 key，则自动实现了过滤功能
      mainPathVariableItems[item.main] = {
        routeName,
        mainPath,
        notFound,
        variableName: `${varPrefix}${variableName}${i}`,
        relativePath: importPath, // 导入模块的路径
        // 这边 item.dynamic 为 zeroValue 才为 false, 即 item.dynamic = false，也为 true
        dynamic: Boolean(item.dynamic),
        chunkName: join(item.main),
        routeMain: normalizeRouteMain(baseDir, item.main),
      };
    }
  }

  async toCodes() {
    // 解析代码
    await this.parseCodes();

    // 生成代码
    const {
      mainPathVariableItems,
      routesConfig,
      hooks,
      asEntry,
      has404,
    } = this;
    let codes = [];

    if (!has404) {
      codes.push("import { createRouter, createDynamicLoader } from '@recore/fx';\n");
    } else {
      codes.push("import { createRouter, createDynamicLoader, RoutePage404 } from '@recore/fx';\n");
    }

    if (hooks) {
      codes.push(`import hooks from '${hooks}';`);
    }
    /* eslint guard-for-in:off */
    const staticImports = [];
    const dynamicImports = [];

    // 处理 import 语句
    for (const key in mainPathVariableItems) {
      const {
        variableName,
        relativePath,
        dynamic,
        chunkName,
        notFound,
        routeName,
      } = mainPathVariableItems[key];

      // 忽略没有查找到的项
      if (notFound || !relativePath) continue;

      if (dynamic) {
        dynamicImports.push(`const ${variableName} = createDynamicLoader(() => import(/* webpackChunkName: "${routeName || chunkName}" */'${relativePath}'))`);
      } else {
        staticImports.push(`import ${variableName} from "${relativePath}"`);
      }
    }
    codes = codes.concat(staticImports, '\n', dynamicImports);

    // 处理 pageMap
    codes.push('const pagesMap = {');
    for (const key in mainPathVariableItems) {
      const item = mainPathVariableItems[key];
      const {
        routeMain, variableName, notFound,
      } = item;
      if (notFound) {
        codes.push(`  "${routeMain}": RoutePage404,`);
      } else {
        codes.push(`  "${routeMain}": ${variableName},`);
      }
    }
    codes.push('};\n');

    // 处理 routes 配置
    const source = JSON.stringify({
      ...routesConfig,
    }, null, '  ');
    codes.push(`const routesConfig = ${source};\n`);

    // 处理 createRouter 参数
    // 如果 asEntry 是 true，则返回"页面"
    // 反之，返回"路由"
    if (!hooks && !asEntry) {
      codes.push('export default createRouter(routesConfig, pagesMap)');
    } else {
      codes.push(`export default createRouter(routesConfig, pagesMap${hooks ? ', hooks' : ', null'}${asEntry ? ', true' : ', false'});`);
    }

    this.codes = codes;

    return this.toString();
  }

  toString() {
    return this.codes.join('\n');
  }

  createBasename(routePath) {
    if (routePath.startsWith('/')) {
      // 绝对路径
      return encodeURIComponent(routePath);
    }
    // 相对路径
    const { basename = '/' } = this;
    return encodeURIComponent(join(decodeURIComponent(basename), routePath));
  }
}


module.exports = Codes;
