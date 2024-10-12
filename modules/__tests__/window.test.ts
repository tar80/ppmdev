import {winpos, winsize} from '../window.ts'

describe('winpos()', function () {
  it('do not specify position. the return position value must be an empty string', () => {
    expect(winpos('%n', undefined)).toBe('');
  });
  it('specify negative number for position. the return position value must be 0', () => {
    expect(winpos('%n', -10, -10)).toBe('*windowposition %n,0,0');
  });
  it('specify position with integer. the return position value must be integer', () => {
    expect(winpos('%n', 10, 10)).toBe('*windowposition %n,10,10');
  });
});

describe('winsize()', function () {
  it('missing positional arguments. the return position value must be an empty string', () => {
    expect(winsize('%n', -10, undefined)).toBe('');
  });
  it('specify position value less than 200. the return position value must be specified value', () => {
    expect(winsize('%%n', -10, 100)).toBe('*windowsize %%n,200,200');
  });
  it('specify position value over than 200. the return position value must be specified value', () => {
    expect(winsize('%%n', 210, 1000)).toBe('*windowsize %%n,210,1000');
  });
});
