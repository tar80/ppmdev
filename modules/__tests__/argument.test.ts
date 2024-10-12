import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {safeArgs} from '../argument.ts';

describe('safeArgs()', function () {
  it('no arguments. must return the default value', () => {
    expect(safeArgs('default1')).toEqual(['default1']);
  });
  it('empty string. must return empty string', () => {
    expect(safeArgs('')).toEqual(['']);
  });
  it('default value is of type string, the return value must be of type string', () => {
    process.argv.push('arg1');
    expect(safeArgs('default1')).toEqual(['arg1']);
    // Returns the default value if no argument is specified
    expect(safeArgs('default1', 'default2')).toEqual(['arg1', 'default2']);
  });
  it('default value is of type number, the return value must de of type number', () => {
    process.argv.push('2');
    PPx.Arguments
    expect(safeArgs('default1', 0)).toEqual(['arg1', 2]);
    expect(safeArgs('default1', 0, 0)).toEqual(['arg1', 2, 0]);
    // If the argument returns NaN, return the default value
    process.argv.push('false');
    expect(safeArgs('default1', 0, 0)).toEqual(['arg1', 2, 0]);
  });
  it('default value is of type boolean, the return value must de of type boolean', () => {
    // Boolean type returns "true" for all values except "false" and "0"
    process.argv.push('0');
    expect(safeArgs(false, false, true, true)).toEqual([true, true, false, false]);
  });
});
