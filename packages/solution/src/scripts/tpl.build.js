const gulp = require('gulp');
const rimraf = require('rimraf');
const gulpRename = require('gulp-rename');
const gulpReplace = require('gulp-replace');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils');


const clear = () => new Promise((resolve) => {
  rimraf.sync('./package');
  resolve();
});

const copy = (filePath, options = {}) => new Promise((resolve, reject) => {
  const { isDir = false, rename } = options;
  let stream = gulp.src(isDir ? `./${filePath}/**/*` : filePath);
  if (rename) {
    stream = stream.pipe(gulpRename(rename));
  }
  stream
    .pipe(gulp.dest(`package/proj${isDir ? `/${filePath}` : ''}`))
    .on('end', () => { resolve(); })
    .on('error', () => { reject(); });
});

const tpl = (filePath, replaceFunc = []) => new Promise((resolve, reject) => {
  let stream = gulp.src(filePath);
  replaceFunc.forEach((item) => {
    stream = stream.pipe(gulpReplace(item.regExp, item.replaceFunc));
  });
  stream
    .pipe(gulpRename(`${filePath}.tpl`))
    .pipe(gulp.dest('package/proj'))
    .on('end', () => { resolve(); })
    .on('error', () => { reject(); });
});

const makePkgJson = () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const newPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    repository: pkg.registry,
    publishConfig: {
      registry: 'http://registry.npm.alibaba-inc.com',
    },
    files: [
      'proj',
      'nowa-questions.js',
    ],
  };
  fs.writeFileSync('package/package.json', JSON.stringify(newPkg, null, '  '));
};

const copyQuesFile = () => {
  gulp.src(path.join(__dirname, '../template/nowa-questions.js'))
    .pipe(gulp.dest('package'));
};

const all = async () => {
  await clear();
  await copy('src', { isDir: true });
  ['.editorconfig', '.eslintignore', '.eslintrc', '.prettierrc', 'tsconfig.json', 'tslint.json'].forEach(async (filename) => {
    await copy(filename);
  });
  await copy('.gitignore', { rename: '~.gitignore.tpl' });
  const htmlReplaceLogic = {
    regExp: /<title>(.*)<\/title>/,
    replaceFunc: () => '<title>{{projectName}}</title>',
  };
  const jsonNameReplaceLogic = {
    regExp: /"name": "(.*)"/,
    replaceFunc: () => '"name": "{{ projectName }}"',
  };
  const jsonDescReplaceLogic = {
    regExp: /"description": "(.*)"/,
    replaceFunc: () => '"description": "{{ description }}"',
  };
  const mdReplaceLogic = {
    regExp: /#(.|\n)+##/,
    replaceFunc: () => `# {{ projectName }}

{{description}}

##`,
  };
  const configReplaceLogic = {
    regExp: /appName: ('|")(.*)('|")/,
    replaceFunc: () => "appName: '{{ appName }}'",
  };
  await tpl('index.html', [htmlReplaceLogic]);
  await tpl('prerender.html', [htmlReplaceLogic]);
  await tpl('package.json', [jsonNameReplaceLogic, jsonDescReplaceLogic]);
  await tpl('abc.json', [jsonNameReplaceLogic]);
  await tpl('README.md', [mdReplaceLogic]);
  await tpl('recore.config.js', [configReplaceLogic]);
  makePkgJson();
  copyQuesFile();
};

try {
  all();
  logger.success('Build Tpl Successfully!');
} catch (err) {
  logger.err(err.message);
  logger.info(err);
}
