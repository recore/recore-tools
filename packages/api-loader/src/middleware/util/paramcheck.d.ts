import middleware from '../index';

type configuration = {
  /** 出错监听 */
  onError?: (err: string, callee: string, data: any, rule: any) => void;
  /** 校验出错时是否中断数据流 */
  breakPipe?: boolean;
};

export declare function config(cfg: configuration): void;

export default middleware;