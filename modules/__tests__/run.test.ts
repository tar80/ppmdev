import PPx from '../ppx';
global.PPx = Object.create(PPx);
import type {NlTypes} from '@ppmdev/modules/types.ts';
import {runPPb, runPPe} from '../run';
import {echoExe} from '../echo';

describe('runPPb()', function () {
  let spy = jest.spyOn(PPx, 'Execute').mockImplementation(() => 0);
  afterEach(() => spy.mockClear());

  it('no arguments specified', () => {
    expect(runPPb({})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe %:*wait 500,2`);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('run options', () => {
    expect(runPPb({startwith: 'min'})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb -min %0ppbw.exe %:*wait 500,2`);

    runPPb({wait: 'later'});
    expect(spy).toHaveBeenCalledWith(`*run -noppb -wait:later %0ppbw.exe %:*wait 500,2`);

    runPPb({priority: 'high'});
    expect(spy).toHaveBeenCalledWith(`*run -noppb -high %0ppbw.exe %:*wait 500,2`);

    runPPb({log: true});
    expect(spy).toHaveBeenCalledWith(`*run -noppb -log %0ppbw.exe %:*wait 500,2`);

    runPPb({job: 'newgroup'});
    expect(spy).toHaveBeenCalledWith(`*run -noppb -newgroup %0ppbw.exe %:*wait 500,2`);

    expect(spy).toHaveBeenCalledTimes(5);
  });

  it('inactive the PPb on back', () => {
    expect(runPPb({startwith: 'bottom'})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb -noactive %0ppbw.exe -k *selectppx %n%:*wait 500,2`);

    runPPb({startwith: 'bottom', x: 0, y: 0, c: '*linemessage test'});
    runPPb({startwith: 'bottom', width: 200, height: 200, c: '*linemessage test'});
    // no window adjustments are made when the option "-c" is specified
    const received = `*run -noppb -noactive %0ppbw.exe -c *linemessage test%:*wait 500,2`;
    expect(spy).toHaveBeenCalledWith(received);
    expect(spy).toHaveBeenCalledWith(received);
  });

  it('all run options', () => {
    expect(runPPb({startwith: 'noactive', wait: 'wait', priority: 'normal', job: 'breakjob', log: true})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb -noactive -wait -normal -breakjob -log %0ppbw.exe %:*wait 500,2`);
  });

  it('ppb options', () => {
    expect(runPPb({bootid: 'a'})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -bootid:a %:*wait 500,2`);

    runPPb({bootmax: 'Z'});
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -bootmax:Z %:*wait 500,2`);

    runPPb({q: true});
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -q %:*wait 500,2`);
  });

  it('change the position of the PPb. minimum position is corrected to 0', () => {
    expect(runPPb({x: -0, y: -10})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -k *windowposition %%n,0,0%:*wait 500,2`);
  });

  it('resize the PPb. minimum size is corrected to 200', () => {
    expect(runPPb({width: 500, height: 20})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -k *windowsize %%n,500,200%:*wait 500,2`);
  });

  it('not enough position and size options. no window operations', () => {
    expect(runPPb({x: 0})).toBeTruthy();
    runPPb({width: 20});
    const received = '*run -noppb %0ppbw.exe %:*wait 500,2';
    expect(spy).toHaveBeenCalledWith(received);
    expect(spy).toHaveBeenLastCalledWith(received);
  });

  it('can not controll window. no window operations', () => {
    expect(runPPb({startwith: 'max', x: 0, y: 0})).toBeTruthy();
    runPPb({startwith: 'min', width: 20, height: 20});
    expect(spy).toHaveBeenCalledWith('*run -noppb -max %0ppbw.exe %:*wait 500,2');
    expect(spy).toHaveBeenLastCalledWith('*run -noppb -min %0ppbw.exe %:*wait 500,2');
  });

  it('print description without color', () => {
    expect(runPPb({desc: 'test1'})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -k ${echoExe} -e "test1 \\n"%:*wait 500,2`);

    // no coloring if fg option is not specified
    runPPb({desc: 'test2', bg: 'red'});
    expect(spy).toHaveBeenLastCalledWith(`*run -noppb %0ppbw.exe -k ${echoExe} -e "test2 \\n"%:*wait 500,2`);
  });
  it('print description with color', () => {
    expect(runPPb({desc: 'test', fg: 'red'})).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(`*run -noppb %0ppbw.exe -k ${echoExe} -e "\\x1b[31mtest\\x1b[49;39m \\n"%:*wait 500,2`);

    expect(runPPb({desc: 'test', fg: 'black', bg: 'red'})).toBeTruthy();
    expect(spy).toHaveBeenLastCalledWith(`*run -noppb %0ppbw.exe -k ${echoExe} -e "\\x1b[41;30mtest\\x1b[49;39m \\n"%:*wait 500,2`);
  });
  it('full options', () => {
    expect(
      runPPb({
        bootid: 'A',
        bootmax: 'Z',
        q: true,
        k: '%%I"full options"',
        startwith: 'bottom',
        wait: 'wait',
        priority: 'normal',
        job: 'breakjob',
        log: true,
        x: 20,
        y: 20,
        width: 20,
        height: 20,
        desc: 'test',
        fg: 'white',
        bg: 'black'
      })
    ).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      `*run -noppb -noactive -wait -normal -breakjob -log %0ppbw.exe -bootid:A -bootmax:Z -q -k *windowposition %%n,20,20%%:*windowsize %%n,200,200%%:*selectppx %n%%:${echoExe} -e "\\x1b[40;37mtest\\x1b[49;39m \\n"%%:%%I"full options"%:*wait 500,2`
    );
  });
});

describe('runPPe()', function () {
  let spy = jest.spyOn(PPx, 'Execute').mockImplementation(() => 0);
  afterEach(() => spy.mockClear());

  const title = 'test';
  const path = 'test/path';
  const history = 'e,g';
  const modify = 'save';

  it('no arguments specified', () => {
    runPPe({});
    expect(spy).toHaveBeenCalledWith('*ppe -utf8bom -crlf -tab:8');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('the wait option is true, "*edit" must be executed', () => {
    runPPe({wait: true});
    expect(spy).toHaveBeenCalledWith('*edit -utf8bom -crlf -tab:8');
  });

  it('a path is specified, "-new" must be added', () => {
    runPPe({wait: true, path});
    expect(spy).toHaveBeenCalledWith(`*edit -new -utf8bom -crlf -tab:8 ${path}`);
  });

  it('specifying an incorrect encodeing, it must be corrected to "-utf8bom"', () => {
    const correct = 'sjis';
    runPPe({wait: true, encode: correct, path});
    expect(spy).toHaveBeenCalledWith(`*edit -new -${correct} -crlf -tab:8 ${path}`);

    const incorrect = 'sji';
    // @ts-ignore
    runPPe({wait: true, encode: incorrect, path});
    expect(spy).toHaveBeenCalledWith(`*edit -new -utf8bom -crlf -tab:8 ${path}`);
  });

  it('specifying an incorrect linefeed, it must be corrected to "-crlf"', () => {
    const correct = 'lf';
    runPPe({linefeed: correct, path});
    expect(spy).toHaveBeenCalledWith(`*ppe -new -utf8bom -${correct} -tab:8 ${path}`);

    const incorrect = 'lr';
    // @ts-ignore
    runPPe({linefeed: incorrect, path});
    expect(spy).toHaveBeenCalledWith(`*ppe -new -utf8bom -crlf -tab:8 ${path}`);
  });

  it('the title option is specified, "*setcaption" must be added into the "-k" option', () => {
    runPPe({title, path});
    expect(spy).toHaveBeenCalledWith(`*ppe -new -utf8bom -crlf -tab:8 ${path} -k %(*setcaption ${title}%)`);
  });

  it('history and modify options must be set as options of "*editmode"', () => {
    runPPe({title, path, history, modify});
    expect(spy).toHaveBeenCalledWith(
      `*ppe -new -utf8bom -crlf -tab:8 ${path} -k %(*setcaption ${title}%:*editmode ${history} -modify:${modify}%)`
    );
  });

  it('saveenc and savelf options must be set as options of "*editmode"', () => {
    // default value of saveenc is "-utf8bom"
    // default value of savelf is "-crlf"
    let saveenc = 'test';
    let savelf: NlTypes | 'test' = 'test';

    // @ts-ignore
    runPPe({title, path, history, modify, saveenc, savelf});
    expect(spy).toHaveBeenCalledWith(
      `*ppe -new -utf8bom -crlf -tab:8 ${path} -k %(*setcaption ${title}%:*editmode ${history} -utf8bom -crlf -modify:${modify}%)`
    );

    saveenc = 'utf8';
    savelf = 'lf';

    runPPe({title, path, history, modify, saveenc, savelf});
    expect(spy).toHaveBeenCalledWith(
      `*ppe -new -utf8bom -crlf -tab:8 ${path} -k %(*setcaption ${title}%:*editmode ${history} -${saveenc} -${savelf} -modify:${modify}%)`
    );
  });

  it('the k option is macro expanded', () => {
    let k = '*insert %FDC';

    runPPe({title, path, k});
    expect(spy).toHaveBeenCalledWith(`*ppe -new -utf8bom -crlf -tab:8 ${path} -k %(*setcaption ${title}%:${k}%)`);
  });
});
