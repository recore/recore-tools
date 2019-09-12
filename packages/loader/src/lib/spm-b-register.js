/**
 * B 码注册器
 */
const Agent = require('agentkeepalive');
const axios = require('axios');
const { join } = require('path');

const keepaliveAgent = new Agent();

// API 文档
// http://spm.alibaba-inc.com/track/info.htm?type=2392&id=26 页面编码(spm-B)注册接口
const SPM_API = 'http://log.alibaba-inc.com/spm/part/aplusResult.htm';
const BASE_DATA = {
  action: 'spmAction', // 必选参数; 接口动作类型, 赋值为常量 "spmAction";
  event_submit_doRequestSpmbForHeYi: 'y', // 必选参数; 赋值为常量 "y";
  spma: '', // 必选参数; 页面所属站点的spm编码, 接口会校验此入参, 其值必须为已注册的站点编码且当前注册的用户ID应有此站点的引用权限;
  appFrom: 'o', // 必选参数; 调用接口的应用编码, 必须在约定的系统名单内. 目前可用的业务应用列表参见文末附表;
  pageName: '', // 必选参数; 页面名称, 中英文字符串, 接口会校验此入参, 其值不得与已注册的站点名称重复;
  pageUrl: '', // 必选参数; 页面URL, URL参数部分无需传入, 如: http://aplus.taobao.com/aplus_test.html.
  pageDesc: '', // 可选参数; 页面说明文本
  workId: '',
};


class SpmBRegister {
  constructor({ spmA, domain }) {
    this.spmA = spmA;
    this.domain = domain;
  }

  async run(pageName, routePath) {
    if (!pageName) pageName = routePath;

    const { spmA: spma, domain } = this;
    const pageUrl = `//${join(domain, routePath)}`;

    return axios.get(SPM_API, {
      httpAgent: keepaliveAgent,
      httpsAgent: keepaliveAgent,
      timeout: 1000,
      params: {
        ...BASE_DATA,
        pageUrl: `//${join(domain, routePath)}`,
        pageName,
        appFrom: 'aecp',
        spma,
      },
    }).then(({ data: content }) => {
      const { code, errorMsg, data } = content;
      if (code === 0) {
        return Promise.reject(new Error(errorMsg));
      }
      return Promise.resolve({
        [pageUrl]: data.spmb,
      });
    });
  }
}

module.exports = SpmBRegister;
