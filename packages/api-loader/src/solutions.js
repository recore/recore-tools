const path = require('path');
const log = require('./log');

const solutions = {};

function genImportDeclare(names, tsFilePath, autoMock) {
  const mws = {};
  const npmImports = [];
  const proImports = [];
  names.forEach((name) => {
    if (!solutions[name]) {
      return;
    }
    let pipes = [];
    pipes = pipes.concat(solutions[name].pipe);
    if (autoMock) {
      pipes = pipes.concat(solutions[name].mock || []);
    }
    pipes.forEach((p) => {
      if (mws[p.name]) return;
      // relate path or npm path
      if (p.path.startsWith('.')) {
        const pathOfPrj = path.join(process.cwd(), 'src', path.dirname(p.path));
        const relativePath2File = path.relative(path.dirname(tsFilePath), pathOfPrj) || './';
        mws[p.name] = path.join(relativePath2File, path.basename(p.path));
        proImports.push(`import ${p.name} from '${mws[p.name]}';`);
      } else {
        mws[p.name] = p.path;
        npmImports.push(`import ${p.name} from '${mws[p.name]}';`);
      }
    });
  });
  return { imports: [].concat(npmImports, proImports), mws: Object.keys(mws) };
}

function setSolutions(solutionFiles) {
  for (const customSol of solutionFiles) {
    try {
      // eslint-disable-next-line import/no-dynamic-require
      const userDefined = require(customSol);
      Object.assign(solutions, userDefined.default || userDefined);
      log(`已加载solution: ${customSol}`);
    } catch (e) {
      log(`未加载${customSol}`);
    }
  }
}

setSolutions([
  `${process.cwd() + path.sep}api.config.js`,
]);

module.exports = {
  solutions,
  genImportDeclare,
  setSolutions,
};
