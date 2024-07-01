import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {semver, expandNlCode, checkUpdate, waitUntil, actualParentDirectory, windowID, codeToChar, hexToNum, numToHex} from '../util.ts';

describe('expandNlCode()', function () {
  it('should return line break code "crlf"', () => {
    expect(expandNlCode('test\r\n')).toBe('\r\n');
  });
  it('should return line break code "cr"', () => {
    expect(expandNlCode('test\r')).toBe('\r');
  });
  it('should return line break code "lf"', () => {
    expect(expandNlCode('test\n')).toBe('\n');
  });
});

describe('semver()', function () {
  it('convert 0.2 to 10200', () => {
    expect(semver(0.2)).toBe(0.02);
    expect(semver('0.2')).toBe(0.02);
  });
  it('convert 1.2 to 10200', () => {
    expect(semver(1.2)).toBe(10200);
    expect(semver('1.2')).toBe(10200);
  });
  it('convert 1.23 to 12300', () => {
    expect(semver(1.23)).toBe(12300);
    expect(semver('1.23')).toBe(12300);
  });
  it('convert 1.2.3.4 to 10203', () => {
    expect(semver('1.2.3')).toBe(10203);
  });
  it('convert 1.20.30 to 12030', () => {
    expect(semver('1.2.3')).toBe(10203);
  });
});

describe('checkUpdate()', function () {
  it('1.12.0 is a higher version than 1.2', () => {
    expect(checkUpdate('1.12.0', '1.2')).toBeTruthy();
  });
  if ('1.01.1 is a higher version than 1.1') {
    expect(checkUpdate('1.01.1', '1.1')).toBeTruthy();
  }
});

describe('waitUntil()', function () {
  let count: number;
  const callback = (v: unknown) => {
    if (typeof v === 'number') {
      count--;
      return count <= 0;
    }
    return false;
  };
  it('process completed within waiting time. must return true', () => {
    count = 9;
    expect(waitUntil(count, callback, 3000, 300)).toBeTruthy();
  });
  it('process dit not complete within the waiting time. must return false', () => {
    count = 11;
    expect(waitUntil(count, callback, 3000, 300)).toBeFalsy();
  });
});

describe('actualParentDirectory()', function () {
  it('parent directory points to a file-system:path, must return the path as is', () => {
    const resp = 'DRIVE:\\DIR'
    expect(actualParentDirectory(resp)).toBe(resp);
  });
  it('parent directory points to a aux:path, the aux protocol must be omitted ', () => {
    const resp = 'DRIVE:\\DIR'
    let path = `aux:S_debug\\${resp}`
    expect(actualParentDirectory(path)).toBe(resp);
    path = `aux://M_debug/${resp}`
    expect(actualParentDirectory(path)).toBe(resp);
  });
});

describe('windowID()', function () {
  it('must return an object containing "id" and "uid". "uid" are separated by an underescore', () => {
    let id = 'CA';
    let uid = 'C_A'
    let spy = jest.spyOn(PPx, 'Extract').mockImplementation(() =>id);
    expect(windowID()).toEqual({id, uid})
    id = 'CZaa';
    uid = 'C_Zaa'
    spy = jest.spyOn(PPx, 'Extract').mockImplementation(() =>id);
    expect(windowID()).toEqual({id, uid})
    spy.mockRestore()
  });
});

describe('codeToChar()', function () {
  it('the first character of the value is "x", the rest are considered a hexadecimal character code', () => {
    const value = 'x41';
    const resp = 'A';
    expect(codeToChar(value)).toBe(resp)
  });
  it('the first character of the value is "u", the rest is considered a decimal character code', () => {
    const value = 'u65';
    const resp = 'A';
    expect(codeToChar(value)).toBe(resp)
  });
  it('the first character of the value is "u". If the rest is not a number, return it as is', () => {
    const value = 'uabc';
    const resp = 'abc';
    expect(codeToChar(value)).toBe(resp)
  });
  it('the first character of the value is neither  "x" nor "u". return it as is', () => {
    const value = '65';
    const resp = '65';
    expect(codeToChar(value)).toBe(resp)
  });
});

describe('hexToNum()', function () {
  it('in case of NaN, undefined must be returned', () => {
    expect(hexToNum('-')).toBeUndefined();
    expect(hexToNum('')).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(true)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(NaN)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(null)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum([])).toBeUndefined();
  });
  it('hexadecimal numbers must be converted to number type', () => {
    expect(hexToNum('41')).toBe(65);
  });
});

describe('numToHex()', function () {
  it('in case of NaN, undefined must be returned', () => {
    expect(numToHex(NaN)).toBeUndefined();
    // @ts-ignore
    expect(numToHex()).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(true)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(NaN)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum(null)).toBeUndefined();
    // @ts-ignore
    expect(hexToNum([])).toBeUndefined();
  });
  it('numbers must be converted to hexadecimal', () => {
    expect(numToHex(65)).toBe('41');
    expect(numToHex(-65)).toBe('-41');
  });
});
