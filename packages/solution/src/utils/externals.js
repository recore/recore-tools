const externals = {
  'react-dom': 'var window.ReactDOM',
  react: 'var window.React',
  'prop-types': 'var window.PropTypes',
  '@ali/recore': 'var window.Recore',
  'react-router': 'var window.ReactRouterDOM',
  'react-router-dom': 'var window.ReactRouterDOM',
};


module.exports = function func() {
  return externals;
};
