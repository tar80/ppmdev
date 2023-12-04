import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {semver, expandNlCode, checkUpdate, waitUntil} from '../util.ts';

describe('expandNlCode()', function () {
  it('returns line feed code "crlf"', () => {
    expect(expandNlCode('test\r\n')).toBe('\r\n');
  });
  it('returns line feed code "cr"', () => {
    expect(expandNlCode('test\r')).toBe('\r');
  });
  it('returns line feed code "lf"', () => {
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
  it('process comoleted within waiting time. must return true', () => {
    count = 9;
    expect(waitUntil(count, callback, 3000, 300)).toBeTruthy();
  });
  it('process dit not complete within the waiting time. must return false', () => {
    count = 11;
    expect(waitUntil(count, callback, 3000, 300)).toBeFalsy();
  });
});
