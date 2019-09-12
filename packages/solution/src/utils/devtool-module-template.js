const { join } = require('path');

function create(prjName) {
  return function handleDevtoolModuleFilenameTemplate({ resourcePath }) {
    let aliasPath = resourcePath;

    // 过滤掉样式文件
    if (/\.(less|css|scss|sass)(\?.*)?$/.test(resourcePath)) {
      return `styles://${join('/', resourcePath)}`;
    }

    // 对不同数据进行分类
    if (resourcePath.startsWith('./src') || resourcePath.startsWith('src')) {
      // 处理项目代码
      aliasPath = join(prjName || 'project', resourcePath.replace(/(:?\.\/)?src/, ''));
    } else if (resourcePath.startsWith('./node_modules')) {
      // 处理项目 node_modules
      aliasPath = join(prjName || 'project', resourcePath);
    }/* else if (resourcePath.includes('/nowa-recore-solution')) {
      // 处理 recore-solution
      aliasPath = resourcePath.replace(/.*nowa-recore-solution/, 'nowa-recore-solution');
    } else if (resourcePath.includes('webpack')) {
      aliasPath = join('nowa-recore-solution', resourcePath);
    }*/
    return `webpack:///${aliasPath}`;
  };
}

module.exports = {
  create,
};
