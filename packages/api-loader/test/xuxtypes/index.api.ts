import { UserInfo } from './typedef.api';

declare namespace xuxtypes {
  type User = UserInfo;
  type other = {
    name: string
  }
}

export default xuxtypes;
