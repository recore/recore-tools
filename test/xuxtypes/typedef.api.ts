type Cloth = {
  /** /^\w{1,3}$/ :; 品牌 */
  brand: string;
  price: number;
}

export type UserInfo = {
  /** /^\w{1,3}$/ :; 名称 */
  name: string,
  /** [0, 200] :; 年龄 */
  age: number,
  /** 0.8 :; 性别 */
  male: boolean,
  cloth: 'T-shirt' | 1 | false | string | Cloth;
  hair: 'no-hair',
};

export function UserInfo(info: UserInfo) {
  if (info.male && info.cloth === 'dress') {
    return 'man in dress?';
  }
  if (!info.cloth) {
    return 'cloth should be defined';
  }
}