import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {permission, existence} from '../permission.ts';
import {colorlize} from '../ansi.ts';

const pass = colorlize({esc: false, message: ' PASS ', fg: 'green'});
const drop = colorlize({esc: false, message: ' DROP ', fg: 'red'});

describe('existence()', function () {
  const deco = (name: string) => `\x1b[33m${name}\x1b[49;39m`;
  const header = 'test'

  it('not specified items. the return value must be [true, "<error message>"]', () => {
    expect(existence('libExists',header, [])).toEqual([true, `${drop} ${header}: There are no items`]);
  });
  it('pass non-existent file name. the return value must be [true, "<error message>"]', () => {
    const path = PPx.Extract('%*name(LDC,%sgu"ppmlib")');
    const name = 'nonexistent';
    expect(existence(name, header, ['test'])).toEqual([
      true,
      `${drop} ${header}: ${path}/${name}.js is not found`
    ]);
  });
  it('libExists "pass" pattern', () => {
    const name = 'libExists';
    const items = ['ppxscr', 'ppxkey'];
    expect(existence(name, header, items)).toEqual([
      false,
      `${pass} ${header}: ${items.join(', ')}`
    ]);
  });
  it('libExists "fail" pattern', () => {
    const name = 'libExists';
    const items = ['nonexistent', '1234'];
    expect(existence(name, header, items)).toEqual([
      true,
      `${drop} ${header}: ${deco(items[1])}, ${deco(items[0])}`
    ]);
  });
  it('exeExists "pass" pattern', () => {
    const name = 'exeExists';
    const items = ['git', 'echo.exe'];
    const executables = ['git.exe', 'echo.exe'];
    expect(existence(name, header, items)).toEqual([
      false,
      `${pass} ${header}: ${executables.join(', ')}`
    ]);
  });
  it('exeExists "fail" pattern', () => {
    const name = 'exeExists';
    const items = ['nonexistent', '1234.exe'];
    const executables = ['nonexistent.exe', '1234.exe'];
    expect(existence(name, header, items)).toEqual([
      true,
      `${drop} ${header}: ${deco(executables[0])}, ${deco(executables[1])}`
    ]);
  });
});

describe('codeType()', function () {
  it('allow unicode. the return value must be [false, "<pass message>"]', () => {
    expect(permission.codeType(2)).toEqual([false, `${pass} Using PPx Unicode`]);
  });
  it('disallow unicode. the return value must be [true, "<fail message>"]', () => {
    expect(permission.codeType(1)).toEqual([
      true,
      `${drop} Using PPx Unicode. Required MultiByte`
    ]);
  });
});

describe('ppxVersion', function () {
  it('meet the version', () => {
    let version = 19000
    expect(permission.ppxVersion(version)).toEqual([false, `${pass} PPx version ${version} or later`]);
    version = 19001
    expect(permission.ppxVersion(version)).toEqual([false, `${pass} PPx version ${version} or later`]);
    version = 191.1
    const exp = 19101
    expect(permission.ppxVersion(version)).toEqual([false, `${pass} PPx version ${exp} or later`]);
  });
  it('does not meet the version', () => {
    expect(permission.ppxVersion(200)).toEqual([true, `${drop} PPx version 20000 or later`]);
  });
});

describe('scriptVersion()', function () {
  const scriptEngine = PPx.ScriptEngineName;

  it('meet the version', () => {
    const version = 1;
    expect(permission.scriptVersion(version)).toEqual([
      false,
      `${pass} ${scriptEngine} module R${version} or later`
    ]);
  });
  it('does not meet the version', () => {
    const version = 99;
    expect(permission.scriptVersion(version)).toEqual([
      true,
      `${drop} ${scriptEngine} module R${version} or later`
    ]);
  });
});

describe('scriptType()', function () {
  it('meet the version', () => {
    expect(permission.scriptType(0)).toEqual([false, `${pass} Use engine anything`]);
    expect(permission.scriptType(4)).toEqual([false, `${pass} Use engine Chakra(ES6)`]);
    expect(permission.scriptType(5)).toEqual([true, `${drop} Use engine CV8(ES2021)`]);
    expect(permission.scriptType(6)).toEqual([true, `${drop} Use engine QuickJS(ES2023)`]);
  });
  it('does not meet the version', () => {
    expect(permission.scriptType(1)).toEqual([true, `${drop} Use engine JS9(5.7)`]);
  });
});

describe('ppmVersion()', function () {
  const passedVersion = (version: string | number): void => {
    expect(permission.ppmVersion(version)).toEqual([
      false,
      `${pass} ppx-plugin-manager version ${version} or later`
    ]);
  };
  const failedVersion = (version: string | number): void => {
    expect(permission.ppmVersion(version)).toEqual([
      true,
      `${drop} ppx-plugin-manager version ${version} or later`
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
    expect(permission.libRegexp('bregonig')).toEqual([false, `${pass} Using bregonig.dll`]);
  });
  it('not using bregonig.dll', () => {
    expect(permission.libRegexp('RegExp')).toEqual([true, `${drop} Using bregonig.dll`]);
  });
});
