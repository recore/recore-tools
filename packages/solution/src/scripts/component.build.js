const gulp = require('gulp');
const babel = require('gulp-babel');
const { presets, plugins } = require('../config/babel-config');
const { logger } = require('../utils');

const trasnform = new Promise((resolve, reject) => {
  const task = gulp.src('src/**/*.js')
    .pipe(babel({
      presets,
      plugins,
    }))
    .pipe(gulp.dest('build'));
  task.on('end', () => resolve());
  task.on('error', err => reject(err));
});

const copy = new Promise((resolve, reject) => {
  const task = gulp.src('src/**/*.!(js)').pipe(gulp.dest('build'));
  task.on('end', () => resolve());
  task.on('error', err => reject(err));
});

Promise.all([
  trasnform,
  copy,
]).then(() => {
  logger.success('Build Successfully!');
  // logger.info('Next\n\n\t$ tnpm publish');
}).catch((err) => {
  logger.err(err.message);
  logger.info(err);
});
