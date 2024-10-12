import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {actualParentDirectory, extractFileName, pathJoin, pathNormalize, pathSelf} from '../path.ts';

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
  it('pass some invalid separators. must return an error', function () {
    expect(() => pathNormalize('c:/bin/a/b/c/', '')).toThrow(new Error('Incorrect separator'));
    expect(() => pathNormalize('c:/bin/a/b/c/', '@')).toThrow(new Error('Incorrect separator'));
  });
  it('pass an empty path. must return an error', function () {
    expect(() => pathNormalize('', '/')).toThrow(new Error('Path must be of type string, and not be an empty string'));
  });
  it('normalized slash-separated patterns', function () {
    expect(pathNormalize('c:/a\\b\\c/', '/')).toBe('c:/a/b/c/');
    expect(pathNormalize('c:/a\\b\\c', '/')).toBe('c:/a/b/c');
  });
  it('normalized backslash-separated patterns', function () {
    expect(pathNormalize('c:/a\\b\\c/', '\\')).toBe('c:\\a\\b\\c\\');
    expect(pathNormalize('c:/a\\b\\c', '\\')).toBe('c:\\a\\b\\c');
  });
});

describe('actualParentDirectory()', function () {
  it('parent directory points to a file-system:path, must return the path as is', () => {
    const resp = 'DRIVE:\\DIR';
    expect(actualParentDirectory(resp)).toBe(resp);
  });
  it('parent directory points to a aux:path, the aux protocol must be omitted ', () => {
    const resp = 'DRIVE:\\DIR';
    let path = `aux:S_debug\\${resp}`;
    expect(actualParentDirectory(path)).toBe(resp);
    path = `aux://M_debug/${resp}`;
    expect(actualParentDirectory(path)).toBe(resp);
  });
});

describe('extractFileName()', function () {
  it('to get the filename, you must specify the correct path separator', () => {
    let path = 'http://path/to/web/page.html';
    expect(extractFileName(path, '\\')).toBe(path);
    expect(extractFileName(path, '/')).toBe('page.html');
  });
  it('the sep option is not specified, the path separator must be a backslash', () => {
    const path = 'C:\\path\\to\\filename.txt';
    expect(extractFileName(path)).toBe('filename.txt');
  });
  it('the sep is wrong character, the path separator must be corrected a backslash', () => {
    const path = 'C:\\path\\to\\filename.txt';
    expect(extractFileName(path, '@')).toBe('filename.txt');
  });
});
