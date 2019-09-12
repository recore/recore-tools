/*
 * ExportDefaultDeclaration
 */


export default {
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
