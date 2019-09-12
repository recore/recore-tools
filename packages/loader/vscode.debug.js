const webpack = require('webpack');
const { resolve } = require('path');

const entryFilePath = resolve(__dirname, './test/visionx-transform/source/app.1.vx');

function getTestWebPackConfig(entry, callback) {
  const loader = resolve(__dirname, './src/index.js');
  const compiler = webpack({
    entry,
    output: {
      path: resolve(__dirname, './build'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.vx$/,
          loader,
        },
      ],
    },
    externals: {
      'react-dom': 'var window.ReactDOM',
      react: 'var window.React',
      'prop-types': 'var window.PropTypes',
      '@recore/fx': 'var window.Recore'
    },
    context: resolve(__dirname),
    watch: true,
    mode: 'development',
  });
  compiler.run(callback);
}


getTestWebPackConfig(entryFilePath, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err || stats.toJson().errors[0]);
  }
  console.log(`${stats.endTime - stats.startTime} ms`);
});
