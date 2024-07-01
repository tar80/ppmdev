import {isEmptyObj, isEmptyStr, isError, isInteger, isBottom, isZero, withinRange} from '../guard';

describe('isEmptyStr()', function () {
  it('must return true for an empty string', function () {
    expect(isEmptyStr('')).toBeTruthy();
  });
  it('must return false for all non-empty strings', function () {
    expect(isEmptyStr('abc')).toBeFalsy();
    expect(isEmptyStr('\n\t')).toBeFalsy();
    expect(isEmptyStr(' ')).toBeFalsy();
    // @ts-ignore
    expect(isEmptyStr()).toBeFalsy();
    // @ts-ignore
    expect(isEmptyStr(/^.*$/)).toBeFalsy();
    // @ts-ignore
    expect(isEmptyStr(true)).toBeFalsy();
  });
});

describe('isEmptyObj', function () {
  it('must return true for an empty object', () => {
    expect(isEmptyObj({})).toBeTruthy();
  });
  it('must return false for an object that has properties ', () => {
    const key = '';
    expect(isEmptyObj({1: 1})).toBeFalsy();
    expect(isEmptyObj({one: '1'})).toBeFalsy();
    expect(isEmptyObj({true: true})).toBeFalsy();
    expect(isEmptyObj({undefined: undefined})).toBeFalsy();
    expect(isEmptyObj({[key]: null})).toBeFalsy();
    // @ts-ignore
    expect(isEmptyObj()).toBeFalsy();
  });
});

describe('isError()', function () {
  it('must return true if "error" is true and "value" type is string', () => {
    const error = true;
    const value = '1';
    expect(isError(error, value)).toBeTruthy();
  });
  it('must return false if "error" is false and "value" type is string', () => {
    const error = false;
    const value = '1';
    expect(isError(error, value)).toBeFalsy();
  });
  it('must return false if "error" is true and "value" type is not string', () => {
    const error = true;
    const value = 1;
    expect(isError(error, value)).toBeFalsy();
  });
  it('must return false if "error" is false and "value" type is not string', () => {
    const error = false;
    const value = true;
    expect(isError(error, value)).toBeFalsy();
  });
});

describe('isInteger()', function () {
  it('must return true for integers', () => {
    expect(isInteger(-1)).toBeTruthy();
    expect(isInteger(2e4)).toBeTruthy();
    expect(isInteger(1024 * 1024)).toBeTruthy();
    expect(isInteger(0xabc)).toBeTruthy();
    expect(isInteger(0o111)).toBeTruthy();
    expect(isInteger(0b111)).toBeTruthy();
  });
  it('must return false it not an integer', () => {
    expect(isInteger(NaN)).toBeFalsy();
    expect(isInteger(Infinity)).toBeFalsy();
    expect(isInteger(1n)).toBeFalsy();
    expect(isInteger(1 / 0)).toBeFalsy();
    expect(isInteger(3.14)).toBeFalsy();
    expect(isInteger(2e-4)).toBeFalsy();
    expect(isInteger(undefined)).toBeFalsy();
    expect(isInteger(null)).toBeFalsy();
    expect(isInteger('1')).toBeFalsy();
  });
});

describe('isBottom()', function () {
  it('must return ture for bottom types', () => {
    expect(isBottom(undefined)).toBeTruthy()
    expect(isBottom(null)).toBeTruthy()
  });
  it('must return ture for void type', () => {
    const func = () => {};
    expect(isBottom(func())).toBeTruthy();
  });
  it('must return false for not of bottom or void types', () => {
    expect(isBottom('undefined')).toBeFalsy()
    expect(isBottom(typeof null)).toBeFalsy()
    expect(isBottom(true)).toBeFalsy()
  });
});

describe('isZero()', function () {
  it('must return true for number 0', () => {
    expect(isZero(0)).toBeTruthy()
    expect(isZero(-0)).toBeTruthy()
  });
  it('must return true for string "0"', () => {
    expect(isZero("0")).toBeTruthy()
  });
  it('must return false for 0 or "0"', () => {
    expect(isZero("-0")).toBeFalsy()
    expect(isZero(1)).toBeFalsy()
    // @ts-ignore
    expect(isZero(true)).toBeFalsy()
  });
});

describe('withinRange()', function () {
  it('must return true if "n" is in the range 0 to "max"', () => {
    expect(withinRange(-0, 2)).toBeTruthy();
    expect(withinRange(0, 0)).toBeTruthy();
    expect(withinRange(0, 2)).toBeTruthy();
    expect(withinRange(1, 2)).toBeTruthy();
    expect(withinRange(2, 2)).toBeTruthy();
    // @ts-ignore
    expect(withinRange('1', '2')).toBeTruthy();
  });
  it('must return false if "n" is not in range 0 to "max"', () => {
    expect(withinRange(-1, 2)).toBeFalsy();
    expect(withinRange(3, 2)).toBeFalsy();
    expect(withinRange(3, 2)).toBeFalsy();
    expect(withinRange(NaN, 2)).toBeFalsy();
    expect(withinRange(0, NaN)).toBeFalsy();
    // @ts-ignore
    expect(withinRange('3', '2')).toBeFalsy();
    // @ts-ignore
    expect(withinRange('string', '2')).toBeFalsy();
    // @ts-ignore
    expect(withinRange('0', 'string')).toBeFalsy();

  });
});
