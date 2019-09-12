const { basename } = require('path');

module.exports = function options(result) {
  return [
    {
      type: 'input',
      name: 'projectName',
      message: '项目名',
      default() {
        return basename(result.ctxPath);
      },
    },
    {
      type: 'input',
      name: 'description',
      message: '描述信息',
      default(inputs) {
        return `A Recore application ${inputs.projectName}.`;
      },
    },
    {
      type: 'input',
      name: 'appName',
      message: 'BUC 应用名',
      default(inputs) {
        return inputs.projectName;
      },
    },
  ];
};
