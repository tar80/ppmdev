import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx)
import {parseString} from '../json.ts'

describe('parseArgs()', function () {
  it('pass unicode strings', () => {
    const title = 'テスト';
    const args = `{"title":"${title}"}`;
    const resp = parseString(args);
    const exp = resp ? JSON.parse(resp) : {};
    expect(exp).toEqual({title});
  });
  it('pass a path with backslash', () => {
    const text = 'c:\\a\\b\\c.txt';
    const args = `{"text": "${text}"}`;
    const resp = parseString(args);
    const exp = resp ? JSON.parse(resp) : {};
    expect(exp).toEqual({text});
  });
  it('pass a string containing quotes', () => {
    const input = `test "test" 'test'`;
    const args = `{"input": "${input}"}`;
    const resp = parseString(args);
    const exp = resp ? JSON.parse(resp) : {};
    expect(exp).toEqual({input});
  });
});

