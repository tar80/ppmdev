import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {pathJoin, pathNormalize, pathSelf} from '../path';

describe('pathSelf()', function () {
  it('PPx.ScriptName returned the full path', () => {
    Object.defineProperty(PPx, 'ScriptName', {value: 'c:\\bin\\test\\data.js'});
    expect(pathSelf()).toEqual({scriptName: 'data.js', parentDir: 'C:\\bin\\test'});
  });
  it('PPx.ScriptName returned the file name', () => {
    const cwd = PPx.Extract('%FDN').replace(/\\$/, '');
    Object.defineProperty(PPx, 'ScriptName', {value: 'data.js'});
    expect(pathSelf()).toEqual({scriptName: 'data.js', parentDir: cwd});
  });
  it('patterns where the path contains spaces', () => {
    Object.defineProperty(PPx, 'ScriptName', {value: 'c:\\program files\\test\\data.js'});
    expect(pathSelf()).toEqual({scriptName: 'data.js', parentDir: 'C:\\program files\\test'});
  });
});

describe('pathJoin()', function () {
  it('pass some strings to arguments', () => {
    expect(pathJoin('1', '2', '3')).toBe('1\\2\\3');
    expect(pathJoin('1', '\\', '3')).toBe('1\\\\\\3');
  });
});

describe('pathNormalize()', function () {
  it('pass some invalid delims. must return an error', function () {
    expect(() => pathNormalize('c:/bin/a/b/c/', '')).toThrow(new Error('Incorrect delimiter'));
    expect(() => pathNormalize('c:/bin/a/b/c/', '@')).toThrow(new Error('Incorrect delimiter'));
  });
  it('pass an empty path. must return an error', function () {
    expect(() => pathNormalize('', '/')).toThrow(new Error('Path must be of type string, and not be an empty string'));
  });
  it('normalized slash delimited patterns', function () {
    expect(pathNormalize('c:/a\\b\\c/', '/')).toBe('c:/a/b/c/');
    expect(pathNormalize('c:/a\\b\\c', '/')).toBe('c:/a/b/c');
  });
  it('normalized backslash delimited patterns', function () {
    expect(pathNormalize('c:/a\\b\\c/', '\\')).toBe('c:\\a\\b\\c\\');
    expect(pathNormalize('c:/a\\b\\c', '\\')).toBe('c:\\a\\b\\c');
  });
});

