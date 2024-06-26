import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {bitToDate, dateToBit, getFiletime, buildLfItem, formLfData, createLfMeta, getLfMeta, splitLfData, parseLfData} from '../listfile';
import {readLines} from '@ppmdev/modules/io';
import {isError} from '@ppmdev/modules/guard';

jest.mock('@ppmdev/modules/io');

const unixEpochJP = [1970, 1, 1, 9];
const unixEpochBit = {high: 27111902, low: 3577643008};
const bit = `${unixEpochBit.high}.${unixEpochBit.low}`;
const testFilepath = 'parsers/__tests__/testlf.xlf';

describe('bitToDate()', function () {
  it('the unix epoch in japan time', () => {
    expect(bitToDate(unixEpochBit.high, unixEpochBit.low)).toEqual(new Date(0));
  });
});
describe('dateToBit()', function () {
  it('the unix epoch in japan time', () => {
    expect(dateToBit(...unixEpochJP)).toEqual(unixEpochBit);
  });
});
describe('getFiletime()', function () {
  it('the unix epoch in japan time', () => {
    expect(getFiletime(unixEpochJP.join(','))).toBe(bit);
  });
});

describe('buildLfItem()', function () {
  const date = new Date(0).toLocaleString().replace(/\D+/g, ',');
  it('empty names, must return undefined', () => {
    expect(buildLfItem({name: ''})).toBeUndefined();
  });
  it('the return value must be a string in ListFile format', () => {
    //NOTE: file size always outputs 0.0
    const table = {name: 'name', sname: 'SNAME', att: 10, date};
    const resp = `"name","SNAME",A:H10,C:${bit},L:${bit},W:${bit},S:0.0`;
    expect(buildLfItem(table)).toBe(resp);
  });
  it('"att" is not a number type, returns 0', () => {
    const table = {name: 'name', sname: 'SNAME', att: NaN, date};
    const resp = `"name","SNAME",A:H0,C:${bit},L:${bit},W:${bit},S:0.0`;
    expect(buildLfItem(table)).toBe(resp);
  });
  it('"ext" is not a integer, returns nothing', () => {
    const table = {name: 'name', sname: 'SNAME', att: NaN, date, ext: 1.1};
    const resp = `"name","SNAME",A:H0,C:${bit},L:${bit},W:${bit},S:0.0`;
    expect(buildLfItem(table)).toBe(resp);
  });
  it('"hl" is not between 1 and 7, returns nothing', () => {
    const table = {name: 'name', sname: 'SNAME', att: NaN, date, ext: 1000, hl: 0};
    const resp = `"name","SNAME",A:H0,C:${bit},L:${bit},W:${bit},S:0.0,X:1000`;
    // @ts-ignore
    expect(buildLfItem(table)).toBe(resp);
  });
  it('"mark" is not between -1 and 1, returns nothing', () => {
    const table = {name: 'name', sname: 'SNAME', att: NaN, date, ext: 1000, hl: 1, mark: 2};
    const resp = `"name","SNAME",A:H0,C:${bit},L:${bit},W:${bit},S:0.0,X:1000,H:1`;
    // @ts-ignore
    expect(buildLfItem(table)).toBe(resp);
  });
  it('double quotes ins "comment" must be escaped', () => {
    const comment = '"comment"'
    const table = {name: 'name', sname: 'SNAME', att: NaN, date, ext: 1000, hl: 1, mark: 1, comment};
    const resp = `"name","SNAME",A:H0,C:${bit},L:${bit},W:${bit},S:0.0,X:1000,H:1,M:1,T:"${comment.replace(/"/g,'""')}"`;
    // @ts-ignore
    expect(buildLfItem(table)).toBe(resp);
  });
});

describe('formLfData()', function () {
  it('name-only pattern', () => {
    const line = `name = value`;
    const rgx = /^(\w+)\s=.*$/;
    const rep = '{"name":"$1"}';
    const resp = '"name","",A:H0,C:0.0,L:0.0,W:0.0,S:0.0';
    expect(formLfData(line, rgx, rep)).toBe(resp);
  });
  it('date pattern', () => {
    const line = `name = value, time = 1970/1/1 GMT+0900`;
    const rgx = /^(\w+)\s=.+time\s=\s(\d+)\/(\d+)\/(\d+)\sGMT\+(\d{2})\d{2}$/;
    const rep = '{"name":"$1","date":"$2,$3,$4,$5"}';
    const resp = `"name","",A:H0,C:${bit},L:${bit},W:${bit},S:0.0`;
    expect(formLfData(line, rgx, rep)).toBe(resp);
  });
  it('all parameters pattern. consecutive double quotes("") in comments must be converted to tilde(`)', () => {
    const line = `name = long name, short name = short name, time = 1970/1/1 GMT+0900, size = 100`;
    const rgx = /^name\s=\s([^,]+),\sshort\sname\s=\s([^,]+),\stime\s=\s(\d+)\/(\d+)\/(\d+)\sGMT\+(\d{2})\d{2},\ssize\s=\s(\d+)$/;
    const rep =
      '{"name":"$1","sname":"$2","create":"$3,$4,$5,$6","access":"$3,$4,$5,$6","write":"$3,$4,$5,$6","size":"0.$7","ext":0,"hl":1,"mark":1,"comment":"abc\\""123"}';
    const resp = `"long name","short name",A:H0,C:${bit},L:${bit},W:${bit},S:0.100,X:0,H:1,M:1,T:"abc\\\`123"`;
    expect(formLfData(line, rgx, rep)).toBe(resp);
  });
  it('comment parameter must be specified last. otherwise, it contains useless parameters', () => {
    const line = `name = long name, short name = short name, time = 1970/1/1 GMT+0900, size = 100`;
    const rgx = /^name\s=\s([^,]+),\sshort\sname\s=\s([^,]+),\stime\s=\s(\d+)\/(\d+)\/(\d+)\sGMT\+(\d{2})\d{2},\ssize\s=\s(\d+)$/;
    const rep =
      '{"name":"$1","sname":"$2","create":"$3,$4,$5,$6","access":"$3,$4,$5,$6","write":"$3,$4,$5,$6","size":"0.$7","ext":0,"hl":1,"mark":1,"comment":"abc\\""123","unknown":"item"}';
    const resp = `"long name","short name",A:H0,C:${bit},L:${bit},W:${bit},S:0.100,X:0,H:1,M:1,T:"abc\\\`123","unknown":"item"`;
    expect(formLfData(line, rgx, rep)).toBe(resp);
  });
});

describe('createLfMeta', function () {
  it('regular metadata', () => {
    const basepath = 'path\\to\\directory';
    const dirtype = '1';
    const resp = [';ListFile', `;Base=${basepath}|${dirtype}`];
    expect(createLfMeta({basepath, dirtype})).toEqual(resp);
  });
  it('ppm plugin metadata', () => {
    const basepath = 'path\\to\\directory';
    const dirtype = '4';
    const charset = 'utf-8';
    const opts = [';ppm=test', ';freq=every'];
    const resp = [';ListFile', ';charset=utf-8', `;Base=${basepath}|${dirtype}`, ...opts];
    expect(createLfMeta({basepath, charset, dirtype, opts})).toEqual(resp);
  });
});
describe('getLfMeta()', function () {
  it('read testlf.xlf. metadata field names must be lowercase', () => {
    const [error, data] = readLines({path: testFilepath});

    if (!isError(error, data)) {
      const metadata = getLfMeta(data.lines);
      console.log(metadata);
      expect(metadata.charset).toBe('utf-8');
      expect(metadata.base).toBe('c:\\path\\to\\parent');
      expect(metadata.dirtype).toBe('1');
      expect(metadata.search).toBe('search words');
      expect(metadata.error).toBe('0000');
      expect(metadata.option).toBe('directory');
      expect(metadata.viewstyle).toBe('M wF20 s1');
    }
  });
});

describe('splitLfData()', function () {
  const decompLine = splitLfData();
  it('pass listfile header', () => {
    const str = ';ListFile';
    expect(decompLine(str)).toEqual([str]);
  });
  it('pass listfile metadata', () => {
    const str = ';Base=C:\\path\\to\\directory';
    expect(decompLine(str)).toEqual([str]);
  });
  it('long-name only pattern. the return must be the same value', () => {
    const str = '"filepath.txt"';
    expect(decompLine(str)).toEqual([str]);
  });
  it('pattern with only long and short names. this pattern is not considered and is returned as is', () => {
    const str = '"filepath.txt","FILEPATH.TXT"';
    expect(decompLine(str)).toEqual([str]);
  });
  it('pass normal listfile. csv information must be omitted', () => {
    const str =
      '"filepath.txt","",A:H2000,C:0.0,L:0.0,W:0.0,S:0.0,T:"comment",Size,0,Create,1961-01-01 9:00:00:000,Last Write,1961-01-01 9:00:00:000,Last Access,1961-01-01 9:00:00:000';
    const resp = ['filepath.txt', '', 'A:H2000', 'C:0.0', 'L:0.0', 'W:0.0', 'S:0.0', 'T:"comment"'];
    expect(decompLine(str)).toEqual(resp);
  });
});

describe('parseLfData()', function () {
  it('pass entry information as an array. the return value. the return value must be of type string and the parentheses must be removed.', () => {
    const data = ['filepath.txt', '', 'A:H2000', 'C:0.0', 'L:0.0', 'W:0.0', 'S:0.0', 'T:"comment"'];
    const resp = {name: 'filepath.txt', sname: '', A: '2000', 'C': '0.0', 'L': '0.0', 'W': '0.0', 'S': '0.0', 'T': 'comment'};
    expect(parseLfData(data)).toEqual(resp);
  });
});
