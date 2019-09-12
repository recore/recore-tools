/**
 * vision 编译插件
 */

const Manager = require('./manager');

const { env: { DEBUG_SOLUTION } } = process;

class VisionCompilerPlugin {
  constructor({ bootstrapPath, ctxPath }) {
    // 资源管理者
    this.manager = new Manager({
      bootstrapPath,
      ctxPath,
    });

    // 开始监听上层指令
    this.manager.listen();
  }

  apply(compiler) {
    // 始终不需要输出到文件系统，直接读取内存
    compiler.hooks.shouldEmit.tap('VisionCompiler', () => (!!DEBUG_SOLUTION));

    // 在 compile 结束之后获取源代码
    compiler.hooks.afterCompile.tapAsync('VisionCompiler', (compilation, callback) => {
      // 编译错误处理
      const { errors } = compilation;
      if (errors.length > 0) {
        this.manager.done(errors);
      } else {
        // 编译结果通知
        const source = compilation.assets['vision.js'].source();
        this.manager.done(null, source);
      }
      // 通知 webpack 继续监听
      callback(null);
    });

    compiler.hooks.failed.tap('VisionCompiler', (err) => {
      this.manager.done([err]);
    });
  }
}

module.exports = VisionCompilerPlugin;
