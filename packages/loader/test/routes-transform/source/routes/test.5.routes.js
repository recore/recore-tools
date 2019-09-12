export default {
  baseDir: './pages',
  routes: [{
    path: '/about',
    main: './about/index',
  }, {
    name: 'home',
    path: '/home',
    main: './home/index',
    dynamic: true,
  }, {
    path: '/home1',
    main: './home1/index',
    dynamic: true,
  }],
};
