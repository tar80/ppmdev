import '@ppmdev/polyfills/arrayRemoveEmpty.ts';
import type {AnsiColors, Letters, Level_String} from '@ppmdev/modules/types.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import {echoExe} from '@ppmdev/modules/echo.ts';
import {colorlize} from '@ppmdev/modules/ansi.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {winpos, winsize} from '@ppmdev/modules/window.ts';

type RunOptions = {
  startwith: '' | 'min' | 'max' | 'noactive' | 'bottom';
  wait: '' | 'wait' | 'idle' | 'later' | 'no';
  priority: 'low' | 'belownormal' | 'normal' | 'abovenormal' | 'high' | 'realtime';
  job: 'breakjob' | 'newgroup';
  log: boolean;
  wd: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
/**
 * run command details.
 * @return ["success or not", ["run details or error message"]]
 */
const runCmdline = ({startwith = '', wait = '', priority, job, log, wd, x, y, width, height}: Partial<RunOptions>): [boolean, String[]] => {
  const startwith_ = {'': '', min: '-min', max: '-max', noactive: '-noactive', bottom: '-noactive'}[startwith];
  const wait_ = {'': '', wait: '-wait', idle: '-wait:idle', later: '-wait:later', no: '-wait:no'}[wait];
  let wd_ = '';

  if (!!wd) {
    const fso = PPx.CreateObject('Scripting.FileSystemObject');

    if (fso.FolderExists(wd)) {
      wd_ = `-d:${wd}`;
    } else {
      return [false, ['[WARNING] Specified working directory is not exist']];
    }
  }

  const priority_ = !!priority ? `-${priority}` : '';
  const job_ = !!job ? `-${job}` : '';
  const log_ = log ? '-log' : '';

  if (x && x > Number(ppm.global('disp_width'))) {
    x = 0;
  }
  if (y && y > Number(ppm.global('disp_height'))) {
    y = 0;
  }

  const pos = x && y ? `-pos:${x},${y}` : '';
  const size = width && height ? `-size:${width},${height}` : '';

  return [true, ['*run', '-noppb', startwith_, wait_, priority_, job_, log_, wd_, pos, size]];
};

type Run = Partial<RunOptions> & {cmd: string};
export const run = ({startwith = '', wait = '', priority, job, log, wd, x, y, width, height, cmd}: Run): boolean => {
  const [ok, runCmd] = runCmdline({startwith, wait, priority, job, log, wd, x, y, width, height});

  if (!ok) {
    return false;
  }

  let resp = true;

  try {
    PPx.Execute(`${runCmd} ${cmd}`);
  } catch (err) {
    resp = false;
  } finally {
    return resp;
  }
};

type PPbOptionsSpec = {bootid?: Letters; bootmax?: Letters; q?: boolean; c?: string; k?: string};
type PPbOptions = {readonly [key in 'id' | 'max' | 'quiet' | 'postcmd']: string};
const ppbCmdline = ({bootid, bootmax, q, c, k}: PPbOptionsSpec): PPbOptions => {
  const id = bootid ? `-bootid:${bootid}` : '';
  const max = bootmax ? `-bootmax:${bootmax}` : '';
  const quiet = q ? '-q' : '';
  const postcmd = c ? c : k ? k : '';

  return {id, max, quiet, postcmd};
};

type Description = {desc: string; fg: AnsiColors; bg: AnsiColors};
type RunPPb = Partial<PPbOptionsSpec> & Partial<RunOptions> & Partial<Description>;
export const runPPb = ({
  bootid,
  bootmax,
  q,
  c,
  k,
  startwith = '',
  wait = '',
  priority,
  job,
  log,
  wd,
  x,
  y,
  width,
  height,
  desc,
  fg,
  bg
}: RunPPb): boolean => {
  {
    const isExists = PPx.Extract('%*ppxlist(-B)').indexOf(`B_${bootid}`) !== -1;

    if (isExists) {
      PPx.Execute(`*focus B${bootid}`);
      return true;
    }
  }

  const [ok, run] = runCmdline({startwith, wait, priority, job, log, wd});

  if (!ok) {
    return false;
  }

  const opts = ppbCmdline({bootid, bootmax, q, c, k});
  const cmdArr = [];

  if (startwith !== 'min' && startwith !== 'max' && !c) {
    cmdArr.push(winpos('%%n', x, y));
    cmdArr.push(winsize('%%n', width, height));

    if (startwith === 'bottom' && !c) {
      cmdArr.push('*selectppx %n');
    }
  }

  if (desc && !isEmptyStr(desc)) {
    cmdArr.push(`${echoExe} -e "${colorlize({esc: true, message: desc, fg, bg})} \\n"`);
  }

  cmdArr.push(opts.postcmd);
  let postcmd: string = '';

  if (cmdArr.length > 0) {
    const stay = c ? '-c ' : '-k ';
    postcmd = stay + cmdArr.removeEmpty().join('%%:');
  }

  const runCmd = [...run, '%0ppbw.exe', opts.id, opts.max, opts.quiet].removeEmpty().join(' ');
  let resp = true;

  try {
    if (/^-k $/.test(postcmd)) {
      postcmd = '';
    }

    PPx.Execute(`${runCmd} ${postcmd}%:*wait 500,2`);
  } catch (err) {
    resp = false;
  } finally {
    return resp;
  }
};

type Stdout = {cmdline: string; wd?: string; extract?: boolean; startmsg?: boolean, hide?: boolean};

/** @deprecated */
export const stdout = ({cmdline, extract = false, startmsg = false, hide = false}: Stdout): Level_String => {
  const def = hide ? '-noppb -hide' : '-min';
  const msg = startmsg ? '' : '-nostartmsg';
  const opts = [def, msg].join(' ');

  if (extract) {
    cmdline = PPx.Extract(cmdline);
  }

  const data = PPx.Extract(`%*run(${opts} %(${cmdline}%))`);
  const errorlevel = Number(PPx.Extract());

  return [errorlevel, data]
};

export const runStdout = ({cmdline, wd, extract = false, startmsg = false, hide = false}: Stdout): Level_String => {
  const def = hide ? '-noppb -hide' : '-min';
  const msg = startmsg ? '' : '-nostartmsg';
  const dir = wd ? `-d:${wd}` : '';
  const opts = [def, msg, dir].join(' ');

  if (extract) {
    cmdline = PPx.Extract(cmdline);
  }

  const data = PPx.Extract(`%*run(${opts} %(${cmdline}%))`);
  const errorlevel = Number(PPx.Extract());

  return [errorlevel, data]
};
