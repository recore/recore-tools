import xuxtypes from './xuxtypes/index.api';

export interface RtType {
  /** `/\w{1,3}\d{1,9}/` 名称 */
  name: string[];
  /** `[1,100]` */
  age: number;
  lang: 'zh' | 'cn' | 1 | true | string | xuxtypes.User;
  male?: string | boolean;
  home?: {
    country: string;
    province: string;
    areacode: number;
  };
  extra: any;
};

/**
 * 用户信息接口
 * @kind ajax
 * @base https://s-api.alibaba-inc.com
 * @header {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
 */
export declare class UserDetail {
  /**
   * 根据区号+手机号获取用户信息
   * @method POST
   * @url /api/getUserDetail
   * @param areacode 区号
   * @param phone `/\d{7,13}/` 手机号
   */
  getUserDetail(areacode: string, phone: number): Promise<xuxtypes.User>;

  /**
   * 注册用户
   * @kind jsonp
   * @method POST
   * @header a=1
   * @header b=2
   * @url /api/register
   * @param user 基本用户信息
   */
  register(user: xuxtypes.User): Promise<xuxtypes.User>;

  /**
   * @kind ajax
   * @url /api/resetpassword
   * @param id `/\d{12}/` 工号
   * @param mail `/[\d|\w]{8,20}\.[\d|\w]{1,20}/` 邮件
   * @param other 复合规则
   */
  resetpassword(id: string | number, mail: string[], other: RtType): Promise<xuxtypes.User[]>;
}

class UserDetailMock {
  getUserDetail(areacode: string, phone: number): Promise<xuxtypes.User> {
    return new Promise(res => {
      res({ name: areacode + 'dd', age: phone % 1000, male: false, cloth: 1, hair: 'no-hair' });
    });
  }
}

class UserDetailImpl extends UserDetail {
  async getUserDetail(areacode: string, phone: number): Promise<xuxtypes.User> {
    // do something
    const resp = await super.getUserDetail(areacode, phone);
    // do something
    return resp;
  }
}

export default new UserDetailImpl();
