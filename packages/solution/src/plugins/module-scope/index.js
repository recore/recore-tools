const chalk = require('chalk');
const path = require('path');

class ModuleScopePlugin {
  constructor(appSrc, allowedFiles = []) {
    this.appSrcs = Array.isArray(appSrc) ? appSrc : [appSrc];
    this.allowedFiles = new Set(allowedFiles);
  }

  apply(resolver) {
    const { appSrcs } = this;
    resolver.hooks.file.tapAsync(
      'ModuleScopePlugin',
      (request, contextResolver, callback) => {
        if (!request.context.issuer) {
          return callback();
        }
        if (
          request.descriptionFileRoot.indexOf('/node_modules/') !== -1
          || request.descriptionFileRoot.indexOf('\\node_modules\\') !== -1
          || !request.__innerRequest_request
        ) {
          return callback();
        }

        if (
          appSrcs.every((appSrc) => {
            const relative = path.relative(appSrc, request.context.issuer);
            return relative.startsWith('../') || relative.startsWith('..\\');
          })
        ) {
          return callback();
        }
        const requestFullPath = path.resolve(
          path.dirname(request.context.issuer),
          request.__innerRequest_request,
        );

        // 允许从 recore-loader 中加载资源
        if (requestFullPath.includes('recore-loader')) {
          return callback();
        }

        if (this.allowedFiles.has(requestFullPath)) {
          return callback();
        }

        if (
          appSrcs.every((appSrc) => {
            const requestRelative = path.relative(appSrc, requestFullPath);
            return (
              requestRelative.startsWith('../')
              || requestRelative.startsWith('..\\')
            );
          })
        ) {
          return callback(
            new Error(`You attempted to import ${chalk.cyan(request.__innerRequest_request)} which falls outside of the project ${chalk.cyan('src/')} directory. `
                + `Relative imports outside of ${chalk.cyan('src/')} are not supported. `
                + `You can either move it inside ${chalk.cyan('src/')}, or add a symlink to it from project's ${chalk.cyan('node_modules/')}.`),
            request,
          );
        }
        return callback();
      },
    );
  }
}

module.exports = ModuleScopePlugin;
