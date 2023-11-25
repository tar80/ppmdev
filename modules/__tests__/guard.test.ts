import {isEmptyObj, isEmptyStr, isInteger} from '../guard';

describe('isEmptyStr()', function () {
  it('true pattern', function () {
    expect(isEmptyStr('')).toBeTruthy();
  });
  it('false patterns', function () {
    expect(isEmptyStr('abc')).toBeFalsy();
    expect(isEmptyStr('\n\t')).toBeFalsy();
    expect(isEmptyStr(' ')).toBeFalsy();
    // @ts-ignore
    expect(isEmptyStr()).toBeFalsy();
  });
});

describe('isEmptyObj', function () {
  it('true pattern', () => {
    expect(isEmptyObj({})).toBeTruthy()
  });
  it('false patterns', () => {
    const key = '';
    expect(isEmptyObj({1: 1})).toBeFalsy()
    expect(isEmptyObj({one: '1'})).toBeFalsy()
    expect(isEmptyObj({true: true})).toBeFalsy()
    expect(isEmptyObj({undefined: undefined})).toBeFalsy()
    expect(isEmptyObj({[key]: null})).toBeFalsy()
    // @ts-ignore
    expect(isEmptyObj()).toBeFalsy()
  });
});

describe('isInteger()', function () {
  it('true patterns', () => {
    expect(isInteger(-1)).toBeTruthy();
    expect(isInteger(2e4)).toBeTruthy();
    expect(isInteger(1024 * 1024)).toBeTruthy();
    expect(isInteger(0xabc)).toBeTruthy();
    expect(isInteger(0o111)).toBeTruthy();
    expect(isInteger(0b111)).toBeTruthy();
  });
  it('false patterns', () => {
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
