import mw from '../index';

export default mw;

declare global {
  interface Window { __mock__: any; }
}
