const externals = {
  'react-dom': 'var window.ReactDOM',
  react: 'var window.React',
  'prop-types': 'var window.PropTypes',
  '@recore/fx': 'var window.Recore',
};


module.exports = function func() {
  return externals;
};
