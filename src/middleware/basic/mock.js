const RandExp = require('randexp');
const _ = require('lodash');

const mock = (dataDef) => {
  if (!dataDef) {
    return;
  }
  if (dataDef['__optional__'] && Math.random() > 0.5){
    return;
  }
  if (dataDef.__array__) {
    return _.range(_.random(10)).map(mock_single.bind(0, dataDef));
  }
  return mock_single(dataDef);
}

const mock_single = (dataDef) => {
  // 字面量, 直接返回值
  if (dataDef.__literal__) {
    return dataDef.__type__;
  }
  if (dataDef.__simple__) {
    return mock_simple(dataDef);
  }
  return mock_nest(dataDef);
}

const mock_nest = (dataDef) => {
  const reslt = {};
  let d = dataDef.__type__ || dataDef || {};
  // 多层别名函数层层查询
  while (typeof d === 'function' && d.__type__) {
    d = d.__type__;
  }
  if (!d) {
    d = {};
  }
  for (const k of Object.keys(d)) {
    if (k.match(/__\w+__/)) {
      continue;
    }
    reslt[k] = mock(d[k]);
  }
  return reslt;
}

const mock_simple = (dataDef) => {
  const atom = mock_simple_ls[dataDef.__type__.name || dataDef.__type__];
  if (atom) {
    return atom(dataDef);
  }
  console.warn('unrecognize type', dataDef);
  return 
}

const mock_simple_ls = {
  'Number': function (dataDef) {
    return _.random.apply(_, dataDef.__rule__ || [-1000, 1000]);
  },
  'Boolean': function (dataDef) {
    if (typeof dataDef.__rule__ === 'boolean') {
      return dataDef.__rule__;
    }
    const chance = Number(dataDef.__rule__);
    return Math.random() < (Number.isNaN(chance) ? 0.5 : chance);
  },
  'String': function (dataDef) {
    return new RandExp(dataDef.__rule__ || /\w+/).gen();
  },
  'Object': function (dataDef) {
    return mock_simple_ls[['Number', 'Boolean', 'String'][parseInt(Math.random()*3)]](dataDef);
  },
  173: function (dataDef) {
    const v = dataDef.__enum__[_.random(0, dataDef.__enum__.length - 1)];
    if (!v) return;
    return mock_single(v);
  }
};

const request = (config, prev) => {
  console.info('mock req:', config.callee);
  let resp;
  const [clz, method] = config.callee.split('\.');
  let customMockMethod = _.get(config, 'instance.customMock.' + method);
  if (customMockMethod) {
    resp = customMockMethod.call(config.instance.customMock, config, prev);
  } else {
    resp = mock(config.returnRule);
  }
  console.info(customMockMethod? `mock resp(${clz}Mock):` : 'mock resp:', resp);
  return resp;
}

module.exports = request;
module.exports.default = request;
