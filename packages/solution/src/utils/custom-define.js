/**
 * 将用户定义的值 JSON 序列化
 * @param {object} custom 用户自定义
 * @return {object}
 */
function handleCustom(custom) {
  const keys = Object.keys(custom);
  const result = {};
  keys.forEach((key) => {
    const value = custom[key];
    result[key] = JSON.stringify(value);
  });

  return result;
}

/**
 * 合并用户自定义和系统预设
 * @param {object} custom 用户自定义
 * @param {object} system 系统预制
 * @return {object}
 */
function mergeDefine(custom, system) {
  const _custom = handleCustom(custom);
  return Object.assign({}, _custom, system);
}

module.exports = {
  mergeDefine,
};
