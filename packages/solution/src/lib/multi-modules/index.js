/**
 * 多 modules 处理
 * http://gitlab.alibaba-inc.com/recore/recore/issues/59725
 */

const fs = require('fs-extra');
const { join } = require('path');
const RecoreModule = require('./recore-module');

class MultiModules {
  constructor({ resourePath, defaultBootstrapPath, defaultIndexHTMLPath }) {
    this.resourePath = resourePath; // 模块资源地址，即 modules 所在位置
    this.defaultBootstrapPath = defaultBootstrapPath; // 缺省 bootstrap 文件路径
    this.defaultIndexHTMLPath = defaultIndexHTMLPath; // 缺省 index.html 文件卢金
    this.modules = [];
    this.activeModule = null; // 当调用 access 方法后，设置激活的模块
  }

  /**
   * 过滤出目录
   * @param {dirent[]} content
   */
  async _filter(content) {
    const { resourePath } = this;
    async function isDir(dirent) {
      // 该特性在 v10 加入
      if (typeof dirent.isDirectory === 'function') {
        return dirent.isDirectory();
      }
      const f = await fs.stat(join(resourePath, dirent));
      return f.isDirectory();
    }

    return content.filter(isDir).map((dirent) => {
      if (typeof dirent === 'string') {
        return dirent;
      }
      return dirent.name;
    });
  }

  /**
   * 扫描 modules 目录
   * @return {{[name: string]: string}} /path/to/bootstrap
   */
  async scan() {
    // 获取 modules 文件夹下所有文件，返回值中包含 fs.Dirent
    const content = await fs.readdir(this.resourePath, { withFileTypes: true });

    // 过滤出目录
    const dirs = await this._filter(content);

    // 构造 recore-module
    this.modules = dirs.map(dir => new RecoreModule({
      name: dir,
      dir: join(this.resourePath, dir),
    }));

    // TODO: 这边需要有流控机制，不然在数量具体的时候会对 IO 造成巨大冲击
    return Promise.all(this.modules.map(m => m.scan()));
  }

  /**
   * 获取入口 bootstrap
   */
  get entries() {
    const { defaultBootstrapPath, modules } = this;
    const entries = {};
    modules.forEach((m) => {
      const { bootstrap } = m.files;
      entries[m.name] = bootstrap
        ? `${bootstrap.path}?boot&m=${m.name}`
        : `${defaultBootstrapPath}?boot&m=${m.name}`;
    });
    return entries;
  }

  find(moduleName) {
    return this.modules.find(m => m.name === moduleName);
  }

  /**
   * 访问页面
   * 返回实际 HTML 所在位置
   * @param {string} url 请求 URL
   * @return {string} 网页内容
   */
  access(url) {
    if (url === '/') {
      throw new Error('MultiModules ERROR: please choose one module');
    }
    const moduleName = url.split('/')[1];
    const m = this.find(moduleName);

    if (!m) {
      throw new Error(`MultiModules ERROR: no such module: ${moduleName}`);
    }

    this.activeModule = m;

    let content = m.html;
    if (!content) {
      content = fs.readFileSync(this.defaultIndexHTMLPath, 'utf8');
    }

    return content.replace(/<\/head>/, `  <script>
    if (!window.g_config) {
      window.g_config = {};
    }
    window.g_config.routerBasename = '${moduleName}';
    </script>
    </head>`);
  }
}

module.exports = MultiModules;
