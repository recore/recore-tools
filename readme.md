# 一个接口对接方案

设计文档https://yuque.antfin-inc.com/recore/api-loader/introduce

## 简介
有如下文件 `user.api.ts`
``` typescript
/**
 * 用户信息接口
 * @kind ajax
 * @base https://s-api.alibaba-inc.com
 * @header {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
 */
declare class UserDetail {
  /**
   * 根据区号+手机号获取用户信息
   * @method POST
   * @url /api/getUserDetail
   * @param areacode `/+\w{1,3}/` 区号
   * @param phone `/\d{7,13}/` 手机号
   */
  getUserDetail(areacode: string, phone: number): Promise<UserInfo>;
}
```
通过本api-loader(webpack loader)处理，自动生成如下代码
``` typescript
class UserDetailImpl implements UserDetail {
  customMock = new UserDetailMock();
  request = (arg: any, config: any, returnRule: any, methodName: string) => {
    // @ts-ignore
    const func = this.customMock[methodName];
    if (typeof func === 'function' && window.__mock__) {
      return func(arg, config);
    }
    const handle = this.__mock__ ? 'mock' : config.kind;
    return requestHandles[handle](arg, config, returnRule);
  };
  
  async getUserDetail(areacode: String, phone: Number) {
    const argsRule: any = {"areacode":{"__simple__":true,"type":String,"rule":/+\w{1,3}/,"comment":"区号"},"phone":{"__simple__":true,"type":Number,"rule":/\\d{7,13}/,"comment":"手机号"}};
    const returnRule: any = {"type":UserInfo};
    const config: any = {"kind":"ajax","base":"https://s-api.alibaba-inc.com","header":"{'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}","method":"POST","url":"/api/getUserDetail"};
    datacheck(argsRule, {areacode, phone});
    const resp = await this.request({areacode, phone}, config, returnRule, 'getUserDetail');
    datacheck(returnRule, resp);
    return resp;
  }
}
```
## 优势
1. 自动mock
2. 自动做参数校验、返回校验
3. 0实现编码
4. 丰富的ts原生代码提示
![undefined](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/107024/1550735601513-a12c543d-51ab-49a4-ac89-d68941550fec.png) 
![undefined](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/107024/1550735850861-719e2a88-b95b-43b6-acec-28597d6dce84.png) 
![undefined](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/107024/1550735628197-c01bba19-2e96-48b9-9810-c12c824251cf.png) 

## 使用方式
1. `tnpm i --save @ali/api-loader`
2. 在webpack中添加如下loader
```javascript
{
    'test': /\.api\.ts$/,
    'use': [
      {
        loader: '@ali/api-loader',
        options: {
          mock: env === 'development' // webpack开发模式下才启用mock
        }
      }
    ]
  }
```
3. 参考api-loader/test/test.api.ts编写业务逻辑