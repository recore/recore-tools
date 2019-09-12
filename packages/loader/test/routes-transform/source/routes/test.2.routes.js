const baseDir = './pages';

export default {
  baseDir,
  routes: [{
    path: '/about',
    main: './about/about',
  }, {
    path: '/home',
    main: './home/home',
    dynamic: true,
  }],
};
