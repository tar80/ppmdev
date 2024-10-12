import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {colorlize, cursorMove} from '../ansi.ts';

describe('colorlize()', function () {
  it('pass an empty string. the return value must be an empty string', () => {
    expect(colorlize({message: ''})).toBe('');
  });
  it('pass the message. message must be returned without decoration', () => {
    expect(colorlize({message: 'test'})).toBe('test');
  });
  it('pass the message with options. message must be decoreted with escape sequences and returned', () => {
    expect(colorlize({message: 'test', fg: 'black', bg: 'white'})).toBe('\x1b[47;30mtest\x1b[49;39m');
    expect(colorlize({message: 'test', fg: 'black', bg: 'white', esc: true})).toBe(
      '\\x1b[47;30mtest\\x1b[49;39m'
    );
  });
});

describe('cursorMove()', function () {
  it('pass invalid value. must return an error', () => {
    // @ts-ignore
    expect(() => cursorMove('invalid', 1)).toThrow()
  });
  it('cursor moves back two lines. the return value must be decorated with escape seuences', () => {
    expect(cursorMove('u', 2)).toBe('\x1b[2A');
    expect(cursorMove('u', 2, true)).toBe('\\x1b[2A');
  });
});
