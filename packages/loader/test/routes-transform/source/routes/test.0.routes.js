const routesConfig = {
  baseDir: './pages',
  routes: [{
    path: '/about',
    main: './about/about',
  }, {
    path: '/home',
    main: './home/home',
    dynamic: true,
  }],
};

module.exports = routesConfig;
