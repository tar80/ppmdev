import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {permission, existence} from '../permission';

describe('existence()', function () {
  const deco = (name: string) => `\\x1b[33m${name}\\x1b[49;39m`;

  it('not specified items. the return value must be [true, "<error message>"]', () => {
    expect(existence('libExists', 'test', [])).toEqual([true, '\\x1b[41;30m FAIL \\x1b[49;39m There are no items']);
  });
  it('pass non-existent file name. the return value must be [true, "<error message>"]', () => {
    const path = PPx.Extract('%*name(LDC,%sgu"ppmlib")');
    const name = 'nonexistent';
    expect(existence(name, 'test', ['test'])).toEqual([
      true,
      `\\x1b[41;30m FAIL \\x1b[49;39m ${path}/${name}.js is not found`
    ]);
  });
  it('libExists "pass" pattern', () => {
    const name = 'libExists';
    const header = 'Test';
    const items = ['ppxscr', 'ppxkey'];
    expect(existence(name, header, items)).toEqual([
      false,
      `\\x1b[42;30m PASS \\x1b[49;39m ${header}: ${items.join(', ')}`
    ]);
  });
  it('libExists "fail" pattern', () => {
    const name = 'libExists';
    const header = 'Test';
    const items = ['nonexistent', '1234'];
    expect(existence(name, header, items)).toEqual([
      true,
      `\\x1b[41;30m FAIL \\x1b[49;39m ${header}: ${deco(items[1])}, ${deco(items[0])}`
    ]);
  });
  it('exeExists "pass" pattern', () => {
    const name = 'exeExists';
    const header = 'Test';
    const items = ['git', 'echo.exe'];
    const executables = ['git.exe', 'echo.exe'];
    expect(existence(name, header, items)).toEqual([
      false,
      `\\x1b[42;30m PASS \\x1b[49;39m ${header}: ${executables.join(', ')}`
    ]);
  });
  it('exeExists "fail" pattern', () => {
    const name = 'exeExists';
    const header = 'Test';
    const items = ['nonexistent', '1234.exe'];
    const executables = ['nonexistent.exe', '1234.exe'];
    expect(existence(name, header, items)).toEqual([
      true,
      `\\x1b[41;30m FAIL \\x1b[49;39m ${header}: ${deco(executables[0])}, ${deco(executables[1])}`
    ]);
  });
});

describe('codeType()', function () {
  it('allow unicode. the return value must be [false, "<pass message>"]', () => {
    expect(permission.codeType(1)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m Using PPx Unicode']);
  });
  it('disallow unicode. the return value must be [true, "<fail message>"]', () => {
    expect(permission.codeType(2)).toEqual([
      true,
      '\\x1b[41;30m FAIL \\x1b[49;39m Using PPx Unicode. Required MultiByte'
    ]);
  });
});

describe('ppxVersion', function () {
  it('meet the version', () => {
    expect(permission.ppxVersion(19100)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m PPx version 19100 or later']);
    expect(permission.ppxVersion(192.0)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m PPx version 19200 or later']);
    expect(permission.ppxVersion(192)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m PPx version 19200 or later']);
  });
  it('does not meet the version', () => {
    expect(permission.ppxVersion(200)).toEqual([true, '\\x1b[41;30m FAIL \\x1b[49;39m PPx version 20000 or later']);
  });
});

describe('scriptVersion()', function () {
  it('meet the version', () => {
    const version = 1;
    expect(permission.scriptVersion(version)).toEqual([
      false,
      `\\x1b[42;30m PASS \\x1b[49;39m ScriptModule R${version} or later`
    ]);
  });
  it('does not meet the version', () => {
    const version = 99;
    expect(permission.scriptVersion(version)).toEqual([
      true,
      `\\x1b[41;30m FAIL \\x1b[49;39m ScriptModule R${version} or later`
    ]);
  });
});

describe('scriptType()', function () {
  it('meet the version', () => {
    expect(permission.scriptType(0)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m Use JScript version anything']);
    expect(permission.scriptType(4)).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m Use JScript version Chakra(ES6)']);
  });
  it('does not meet the version', () => {
    expect(permission.scriptType(1)).toEqual([true, '\\x1b[41;30m FAIL \\x1b[49;39m Use JScript version JS9(5.7)']);
  });
});

describe('ppmVersion()', function () {
  const passedVersion = (version: string | number): void => {
    expect(permission.ppmVersion(version)).toEqual([
      false,
      `\\x1b[42;30m PASS \\x1b[49;39m ppx-plugin-manager version ${version} or later`
    ]);
  };
  const failedVersion = (version: string | number): void => {
    expect(permission.ppmVersion(version)).toEqual([
      true,
      `\\x1b[41;30m FAIL \\x1b[49;39m ppx-plugin-manager version ${version} or later`
    ]);
  };

  it('meet the version', () => {
    passedVersion(0.91)
    passedVersion('0.91')
    passedVersion('0.9.1')
  });
  it('does not meet the version', () => {
    failedVersion(9.99)
    failedVersion('9.99.99')
  });
});

describe('libRegexp()', function () {
  it('using bregonig.dll', () => {
    expect(permission.libRegexp('bregonig')).toEqual([false, '\\x1b[42;30m PASS \\x1b[49;39m Using bregonig.dll']);
  });
  it('not using bregonig.dll', () => {
    expect(permission.libRegexp('RegExp')).toEqual([true, '\\x1b[41;30m FAIL \\x1b[49;39m Using bregonig.dll']);
  });
});
