const { resolve } = require('path');
const fs = require('fs');
const generator = require('./generator');

const RECORE_OUTPUT_FILENAME = 'recore.umd.min.js';


class RecoreHelper {
  constructor(context) {
    this.context = context;
    this.modulePath = resolve(context, 'node_modules/@ali/recore');
  }

  // 获取 recore 版本
  getVersion() {
    const packageJsonPath = require.resolve(resolve(this.modulePath, 'package.json'));
    const content = JSON.parse(fs.readFileSync(packageJsonPath));
    return content ? content.version : null;
  }

  // 找到输出 recore 的文件地址
  findRecoreOutputFilePath() {
    const recoreUmdFilePath = require.resolve(resolve(this.modulePath, `build/${RECORE_OUTPUT_FILENAME}`));
    return recoreUmdFilePath;
  }

  // 生成输出 reoce 带版本号的文件
  buildRecoreOutputFileWithVersion() {
    const version = this.getVersion();
    return RECORE_OUTPUT_FILENAME.replace('min', `${version}.min`);
  }

  // 构建生成文件到指定位置
  build({ filename, outputPath }, callback) {
    if (!filename) {
      callback(new Error('Can NOT generate the homepage without the entry.'));
      return;
    }
    if (!outputPath) {
      callback(new Error('Can NOT generate the homepage without the output path.'));
      return;
    }

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    const templatePath = resolve(this.context, 'index.html');
    const outputFilename = this.buildRecoreOutputFileWithVersion();

    // 将内容拷贝到指定位置
    fs.copyFile(
      this.findRecoreOutputFilePath(),
      resolve(outputPath, outputFilename),
      (err) => {
        if (err) {
          callback(err);
        } else {
          const result = generator(templatePath, {
            recorejs: outputFilename,
            appjs: `${filename}.js`,
            appcss: `${filename}.css`,
          });
          fs.writeFileSync(resolve(outputPath, 'index.html'), result);
          callback();
        }
      },
    );
  }
}

module.exports = RecoreHelper;
