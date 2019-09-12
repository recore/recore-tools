const { join, resolve } = require('path');
const webpack = require('webpack'); // eslint-disable-line

const entryFilePath = join(__dirname, './test-entry.js');
const outputDirPath = join(__dirname, 'build');
const outputFileName = 'build.js';
// const outputFilePath = join(outputDirPath, outputFileName);

function getTestWebPackConfig(loaderConfig) {
  return {
    mode: 'development',
    entry: entryFilePath,
    // context: join(__dirname),
    output: {
      path: outputDirPath,
      filename: outputFileName,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vx'],
    },
    module: {
      rules: [
        loaderConfig,
      ],
    },
  };
}

webpack(getTestWebPackConfig({
  test: /(\.js)|(\.routes)$/,
  loader: resolve(__dirname, './src/index.js'),
  include: [resolve(__dirname, './test/source')],
}), (error) => {
  console.log('error : ', error); /* eslint-disable-line */
});
