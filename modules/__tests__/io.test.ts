import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {read, readLines, stdout} from '../io.ts';

jest.mock('@ppmdev/modules/io');

const parent = 'modules/__tests__';

describe('read()', function () {
  const cnts = 'あいうえおアイウエオ123456789\n';

  it('pass non-existent path. the return value must be [true, "<error message>"]', () => {
    const path = `${parent}/notExist`;
    expect(read({path})).toEqual([true, `${path} not found`]);
  });
  it('pass an empty file. the return value must be [true, "<error message>"]', () => {
    const path = `${parent}/test_empty`;
    expect(read({path})).toEqual([true, `${path} has no data`]);
  });
  it('pass an utf8 file. the return value must be [false, "<file contents>"]', () => {
    const path = `${parent}/test_utf8`;
    expect(read({path})).toEqual([false, cnts]);
  });
  it('pass an utf16le file. the return value must be [false, "<file contents>"]', () => {
    const path = `${parent}/test_utf16le`;
    expect(read({path, enc: 'utf16le'})).toEqual([false, cnts]);
  });
  it('pass a sjis file. the return value must be [false, "<file contents>"]', () => {
    const path = `${parent}/test_sjis`;
    expect(read({path, enc: 'sjis'})).toEqual([false, cnts]);
  });
});

describe('readLines()', function () {
  it('pass test_pluginlist. the return value must be [false, {lines:["<1st line>", "<2nd line>" ...], nl: "\\n"}]', () => {
    const path = `${parent}/test_pluginlist`;
    const [error, data] = readLines({path});

    if (typeof data !== 'string') {
      expect(error).toBeFalsy();
      expect(data.lines[0]).toBe(';plugin repositories list');
      expect(data.nl).toBe('\n');
    }
  });
});

describe('stdout', function () {
  it('stdout of the echo command. the return value must be [<exitcode>, "<strings><linefeed>"]', () => {
    expect(stdout({cmd: 'echo test'})).toEqual([0, 'test\r\n']);
  });
});
