export type TypeStrut = {
  __name__: string,
  __type__: TypeStrut,
  __text__: string,
  __optional__: boolean,
  __array__: boolean,
  __comment__: string,
  __rule__: string,
  __enum__: TypeStrut[],
  __simple__: boolean,
  [key: string]: TypeStrut | any,
};

export type data = {
  /** 函数入参 */
  param: any,
  /** 函数merge类注释配置 */
  config: any,
  /** 入参类型规则 */
  paramRule: TypeStrut,
  /** 返回类型规则 */
  returnRule: TypeStrut,
  /** 函数名 */
  callee: string
}

export type middleware = (data: data, prev: any) => Promise<any>

export declare const middleware: middleware;

export default middleware;