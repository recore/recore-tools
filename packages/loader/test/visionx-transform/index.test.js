const sinon = require('sinon');

const { resolve, join } = require('path');
const fs = require('fs');
const { expect } = require('chai');
// const rimraf = require('rimraf');
const { runLoaders } = require('loader-runner');

// const _transform = require('@babel/core/lib/transform');
const { RouterEntryDetector, ControllerDetector } = require('../../src/lib/detector');

const buildPath = join(__dirname, './build');
// const transform = sinon.spy(_transform, 'transform');

function getTestWebPackConfig(entryFilePath, options, callback) {
  let cb;
  let op;
  if (arguments.length === 2) {
    cb = options;
  } else {
    op = options;
    cb = callback;
  }

  runLoaders({
    resource: entryFilePath,
    loaders: [{
      loader: require.resolve('../../src/transform/vx/generate'),
      options: op || {},
    }],
  }, cb);
}

try {
  fs.mkdirSync(buildPath);
} catch (e) {
  // empty
}

describe('visionx transform ...', () => {
  it('visionx transform app.1.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.1.vx');
    const outputFilePath = resolve(__dirname, './build/app.1.js');
    // 这里需要写在 RouterEntryDetector 之前，否则会抛错：尝试 wrap 已经 wrapped 的方法
    const cStub = sinon.spy(ControllerDetector.prototype, 'detect');
    const rStub = sinon.spy(RouterEntryDetector.prototype, 'detect');

    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      expect(cStub.called).to.equal(true);
      expect(rStub.called).to.equal(false);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include("['attr',123]");
      expect(newSource).to.include("['attr2',$scope._get('abc')]");
      expect(newSource).to.match(/\$area\.expr\('[\w]+',\(\$scope,\$area\)=>{return\$scope\._get\('hello'\);}\)/);
      expect(newSource).to.include('ViewRender');
      cStub.restore();
      rStub.restore();
      done();
    });
  });


  it('visionx transform app.1.vx with parameter entry', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.1.vx');

    getTestWebPackConfig(entryFilePath, {
      entry: true,
    }, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('ViewRender');
      done();
    });
  });

  it('visionx transform app.1.vx with parameter main', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.1.vx');

    getTestWebPackConfig(entryFilePath, {
      main: true,
    }, (err, { result }) => {
      expect(err).to.equal(null);
      const newSource = result[0];
      expect(newSource).to.include('ViewRender');
      done();
    });
  });

  it('visionx transform app.2.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.2.vx');
    const outputFilePath = resolve(__dirname, './build/app.2.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.match(/\$area\.expr\('[\w]+',\(\$scope,\$area\)=>{return\$scope\._get\('abc'\);}\)\?\$area\.view\('div#[\w]+'\):null/);
      done();
    });
  });

  /*
  // FIXME: complete these tests
  it('visionx transform app.3.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.3.vx');
    const outputFilePath = resolve(__dirname, './build/app.3.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('function($scope,$area){return $scope.$("abc")}');
      expect(newSource).to.include('cond2');
      expect(newSource).to.include('function($scope,$area){return $scope.$("abc") ? 0 : ($scope.$("abc") ? 1 : (2 ? 2 : ($scope.$("abc") ? 3 : (4))))}');
      done();
    });
  });
  it('visionx transform app.4.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.4.vx');
    const outputFilePath = resolve(__dirname, './build/app.4.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('for1');
      expect(newSource).to.include('function($scope,$area){return $scope.$("heros")}');
      expect(newSource).to.include('forif1');
      expect(newSource).to.include('Hello ');
      expect(newSource).to.include('area.e(\'frag1\')');
      done();
    });
  });
  it('visionx transform app.5.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.5.vx');
    const outputFilePath = resolve(__dirname, './build/app.5.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('input');
      expect(newSource).to.include('function($scope,$area){return $scope.$("where")}');
      expect(newSource).to.include('function($scope,$area){return (...x) => xAssign(v => $scope.$set("where", v), () => $scope.$("where"), ...x)},');
      expect(newSource).to.include('(...x) => xAssign(v => $scope.$("a").b.c = v, () => $scope.$("a").b.c, ...x)');
      done();
    });
  });
  it('visionx transform app.6.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.6.vx');
    const outputFilePath = resolve(__dirname, './build/app.6.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('onClick');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("wher")(...x),$area)},');
      expect(newSource).to.include('onKeyUp');
      expect(newSource).to.include('function($scope,$area){return $scope.$action([xModifiers(["enter"]),(...x) => $scope.$("add")(...x)],$area)},');
      done();
    });
  });
  it('visionx transform app.7.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.7.vx');
    const outputFilePath = resolve(__dirname, './build/app.7.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('frag1');
      expect(newSource).to.include('function($scope,$area){return 1 ? ($area.e("cond1") ? area_a2($area) : null) : area_a3($area)},');
      expect(newSource).to.include('x-model');
      expect(newSource).to.include('function($scope,$area){return $scope.$("abc")},');
      expect(newSource).to.include('onChange');
      expect(newSource).to.include('function($scope,$area){return (...x) => xAssign(v => $scope.$set("abc", v), () => $scope.$("abc"), ...x)},');
      expect(newSource).to.include('cond1');
      expect(newSource).to.include('function($scope,$area){return $scope.$("yes")},');
      expect(newSource).to.include('for1');
      expect(newSource).to.include('function($scope,$area){return $scope.$("data")},');
      expect(newSource).to.include('forif1');
      expect(newSource).to.include('function($scope,$area){return $scope.$("item").yes},');
      expect(newSource).to.include('Button');
      expect(newSource).to.include('onClick');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("route")(...x),$area)},');
      done();
    });
  });
  it('visionx transform app.8.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.8.vx');
    const outputFilePath = resolve(__dirname, './build/app.8.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('input');
      expect(newSource).to.include('onChange');
      expect(newSource).to.include('content');
      expect(newSource).to.include('Button');
      expect(newSource).to.include('X(area.c(A.a2), render1)');
      done();
    });
  });
  it('visionx transform app.9.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.9.vx');
    const outputFilePath = resolve(__dirname, './build/app.9.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('Fragment');
      expect(newSource).to.include('["abc", "awef"]');
      expect(newSource).to.include("'Fragment', area.p('v1'),");
      done();
    });
  });
  it('visionx transform app.10.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.10.vx');
    const outputFilePath = resolve(__dirname, './build/app.10.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('ViewFactory');
      expect(newSource).to.include('input');
      expect(newSource).to.include('onChange');
      expect(newSource).to.include('function($scope,$area){return (...x) => xAssign(v => $scope.$set("hero", v), () => $scope.$("hero"), ...x)},');
      expect(newSource).to.include('frag1');
      expect(newSource).to.include('function($scope,$area){return $scope.$("hero")},');
      expect(newSource).to.include("'input', area.p('v2'),");
      done();
    });
  });
  it('visionx transform app.11.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.11.vx');
    const outputFilePath = resolve(__dirname, './build/app.11.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.not.include('function ViewFactory(');
      done();
    });
  });
  it('visionx transform app.12.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.12.vx');
    const outputFilePath = resolve(__dirname, './build/app.12.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.not.include('function ViewFactory(');
      done();
    });
  });
  it('visionx transform app.13.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.13.vx');
    const outputFilePath = resolve(__dirname, './build/app.13.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.not.include('function ViewFactory(');
      done();
    });
  });
  it('visionx transform app.14.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.14.vx');
    const outputFilePath = resolve(__dirname, './build/app.14.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('return area.scope.__routerView(');
      done();
    });
  });

  it('visionx transform app.15.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.15.vx');
    const outputFilePath = resolve(__dirname, './build/app.15.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('style.display');
      expect(newSource).to.include('(!!$scope.$("isOK")) ? \'\' : \'none\'');
      done();
    });
  });


  it('visionx transform app.16.vx', (done) => {
    const entryFilePath = resolve(__dirname, './source/app.16.vx');
    const outputFilePath = resolve(__dirname, './build/app.16.js');
    getTestWebPackConfig(entryFilePath, (err, { result }) => {
      expect(err).to.equal(null);
      let newSource = result[0];
      fs.writeFileSync(outputFilePath, newSource, 'utf8');
      newSource = newSource.replace(/[\n ]+/g, '');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("a")(...x),$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action([(...x) => $scope.$("b")(...x), (...x) => $scope.$("c")(...x)],$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("d").e(...x),$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action([() => $scope.$("f"), function () {}, (...x) => $scope.$("g")(...x), $event => $scope.$("h")(), $event => false ? $scope.$("i")() : $scope.$("j")(), (...x) => $scope.$("k").l(...x)],$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("m")(...x),$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action([(...x) => $scope.$("n")(...x), (...x) => $scope.$("o")(...x)],$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action((...x) => $scope.$("p").q.r(...x),$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action($event => $scope.$("s").t($event, $scope.$("x")),$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action([() => $scope.$("u"), function v() {}, (...x) => $scope.$("w")(...x), $event => $scope.$("x")(), $event => false ? $scope.$("y")() : $scope.$("z")(), (...x) => $scope.$("A").B(...x)],$area)},');
      expect(newSource).to.include('function($scope,$area){return $scope.$action($scope.$("q").bind($scope),$area)},');
      done();
    });
  });
  */
});
