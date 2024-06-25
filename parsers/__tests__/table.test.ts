import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx)
import {properties} from '../table.ts'

describe('properties()', function () {
  it('cannot retrieve anything other than objects', () => {
    expect(properties('X_es')).toEqual({})
  });
});
