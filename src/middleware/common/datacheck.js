const check = (dataDef, data, key) => {
  if (dataDef.__optional__ && !data) {
    return '';
  }
  if (data == void 0) {
    return errName(dataDef) + 'got undefined';
  }
  if (dataDef.__array__) {
    return array(dataDef, data);
  }
  return single(dataDef, data, key);
}

const errName = (dataDef, defaultName) => {
  const name = dataDef.__comment__ || dataDef.__name__ || (dataDef.__type__ && (dataDef.__type__.__comment__ || dataDef.__type__.__name__)) || defaultName;
  return name ? name + ': ' : ''
}

// 单个校验
const single = (dataDef, data, key) => {
  let err;
  if (dataDef.__literal__) {
    return dataDef.__type__ === data ? '' : `${errName(dataDef) || key}'${dataDef.__type__}' not equal '${data}'`;
  }
  if (dataDef.__simple__) {
    err = checker_simple(dataDef, data);
    if (err) {
      return errName(dataDef) + err;
    }
  } else {
    err = checker_nest(dataDef, data);
    if (err) {
      return err;
    }
    // has custom function
    if (typeof dataDef.__type__ === 'function' && dataDef.__type__.__type__) {
      err = dataDef.__type__(data, dataDef);
    } else if (typeof dataDef === 'function' && dataDef.__type__) {
      err = dataDef(data, dataDef);
    }
    return err ? `${errName(dataDef, key)}${err}` : '';
  }
}

// 数组校验
const array = (dataDef, data) => {
  if (data.constructor !== Array) {
    return errName(dataDef) + JSON.stringify(data) + ' is not array';
  }
  for (const d of data) {
    const error = single(dataDef, d);
    if (error) {
      return error;
    }
  }
  return
}

// 简单类型校验
const checker_simple = (dataDef, data) => {
  const simpleCheck = simpleCheckers[dataDef.__type__.name || dataDef.__type__];
  if (simpleCheck) {
    return simpleCheck(dataDef, data);
  }
}

// 混合类型校验
const checker_nest = (dataDef, data) => {
  // dataDef没有__type__时表示该类型为简单类型
  // 否则为引用/内嵌类型或者空对象
  const d = dataDef.__type__ || dataDef || {};
  for (const k of Object.keys(d)) {
    if (k.match(/__\w+__/)) {
      continue;
    }
    const error = check(d[k], data[k], k);
    if (error) {
      return error;
    }
  }
  return '';
}

const simpleCheckers = {
  Number: function (dataDef, data) {
    if (typeof data !== 'number') {
      return JSON.stringify(data) + ' is not number';
    }
    if (dataDef.__rule__ && (dataDef.__rule__[0] > data || dataDef.__rule__[1] < data)) {
      return data + ' is beyond ' + dataDef.__rule__[0] + '~' + dataDef.__rule__[1];
    }
  },
  Boolean: function (dataDef, data) {
    if (typeof data !== 'boolean') {
      return JSON.stringify(data) + ' is not boolean';
    }
  },
  String: function (dataDef, data) {
    if (typeof data !== 'string') {
      return JSON.stringify(data) + ' is not string';
    }
    if (dataDef.__rule__) {
      const pass = dataDef.__rule__.test(data);
      if (!pass) {
        return data + ' mismatch ' + dataDef.__rule__.toString();
      }
    }
  },
  Object: function (dataDef, data) {
    return '';
  },
  173: function (dataDef, data) {
    const matchOne = dataDef.__enum__.find(type => {
      return !single(type, data);
    });
    return matchOne ? '' : data + ' is not in ' + JSON.stringify(dataDef.__enum__);
  }
};

module.exports = function (ruleField) {
  let onError;
  let breakPipe = false;
  this.datacheck = (config, prev) => {
    return new Promise((resolve, reject) => {
      // 既不中断流也没有出错回调,则不校验
      if (!breakPipe && !onError) {
        return resolve(prev);
      }
      const error = check(config[ruleField], prev);
      if (error) {
        onError && onError(error, config.callee, prev, config[ruleField]);
        if (breakPipe) {
          reject(error);
          return;
        }
      }
      resolve(prev);
    });
  }

  this.config = (config) => {
    breakPipe = config.breakPipe;
    onError = typeof onError === 'function' ? config.onError : undefined;
  };
}