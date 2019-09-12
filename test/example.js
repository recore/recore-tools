const fs = require('fs');
const transform = require('../src');


const str = fs.readFileSync('/Users/liangjiawen/workspace/recore/api-loader/test/test.api.ts', 'utf-8');
let code = transform.fromCode('test.api.ts', str, true);
// let code = transform.fromFile('/Users/liangjiawen/workspace/recore/api-loader/test/test.api.ts', true);
// let code = transform.fromFile('/Users/liangjiawen/workspace/recore/api-loader/test/xuxtypes/typedef.api.ts', true);
// let code = transform.fromFile('/Users/liangjiawen/workspace/recore/api-loader/node_modules/xux-types/src/index.ts', true);
// let code = transform.fromFile('/Users/liangjiawen/workspace/recore/api-loader/node_modules/xux-types/src/Employee.ts', true);
fs.writeFileSync("typedef.out.ts", code);

process.exit(0)

require('child_process').execSync('tsc --lib es2015 --noImplicitUseStrict ./typedef.out.ts');
const xuxtypes = require('./typedef.out');
const mock = require('../src/request/mock');
const mockData = mock({}, {}, xuxtypes.UserInfo);

const check = require('../src/utils/datacheck');
mockData.name = 'abcd';
mockData.cloth = 'dress';
mockData.male = true;
const err = check(xuxtypes.UserInfo, mockData);
console.log(err);

// const str = fs.readFileSync('/Users/liangjiawen/workspace/recore/api-loader/test/test.api.ts', 'utf-8');
// transform.fromCode('test.api.ts', str, true);
