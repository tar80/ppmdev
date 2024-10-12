import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {coloredEcho, echoExe} from '../echo.ts';

const ppxe = PPx.Execute;

describe('coloredEcho()', function () {
  let spy: any;
  beforeEach(() => {
    spy = jest.spyOn(PPx, 'Execute');
  });
  afterAll(() => {
    PPx.Execute = ppxe;
  });
  it('message contains backslashes. backslashes must be escaped', () => {
    const message = 'c:\\path\\to\\file';
    coloredEcho('B', message);
    expect(spy).toHaveBeenLastCalledWith(`*execute B,%%OP ${echoExe} -ne '%%(${message.replace(/\\/g, '\\\\')}%%)'`);
  });
});
