import '@ppmdev/polyfills/stringTrim.ts';
import '@ppmdev/polyfills/arrayRemoveEmpty.ts';
import '@ppmdev/polyfills/arrayIndexOf.ts';
import {colorlize} from '@ppmdev/modules/ansi.ts';
import {echoExe} from '@ppmdev/modules/echo.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {type Encodes, fileEnc} from '@ppmdev/modules/meta.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import type {AnsiColors, Letters, Level_String, NlTypes} from '@ppmdev/modules/types.ts';
import {winpos, winsize} from '@ppmdev/modules/window.ts';
import {getEncoder} from 'iconv-lite';

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
const runCmdline = ({startwith = '', wait = '', priority, job, log, wd, x, y, width, height}: Partial<RunOptions>): [boolean, string[]] => {
  const startwith_ = {'': '', min: '-min', max: '-max', noactive: '-noactive', bottom: '-noactive'}[startwith];
  const wait_ = {'': '', wait: '-wait', idle: '-wait:idle', later: '-wait:later', no: '-wait:no'}[wait];
  let wd_ = '';

  if (wd) {
    const fso = PPx.CreateObject('Scripting.FileSystemObject');

    if (fso.FolderExists(wd)) {
      wd_ = `-d:${wd}`;
    } else {
      return [false, ['[WARNING] Specified working directory is not exist']];
    }
  }

  const priority_ = priority ? `-${priority}` : '';
  const job_ = job ? `-${job}` : '';
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
  }

  return resp;
};

type EditModify = (typeof editModify)[number];
const editModify = ['query', 'save', 'silent', 'clear', 'modify', 'write', 'readonly'];

const _getEditmode = (history = '', modify = '', encode = '', linefeed = ''): string => {
  modify = editModify.indexOf(modify) !== -1 ? `-modify:${modify}` : '';

  if (!isEmptyStr(encode)) {
    encode = _getEncode(encode);
  }

  if (!isEmptyStr(linefeed)) {
    linefeed = ['crlf', 'cr', 'lf'].indexOf(linefeed) !== -1 ? `-${linefeed}` : '-crlf';
  }

  const param = [history, encode, linefeed, modify].removeEmpty();

  return param.length > 0 ? `*editmode ${param.join(' ')}` : '';
};

const _getEncode = (encode: string): string => {
  if (!~encode.indexOf('codepage:')) {
    encode = fileEnc.indexOf(encode as Encodes) !== -1 ? encode : 'utf8bom';
  }

  return `-${encode}`;
};

export const runPPe = ({
  wait = false,
  path = '',
  encode = 'utf8bom',
  linefeed = 'crlf',
  title,
  tab = 8,
  history,
  modify,
  saveenc,
  savelf,
  k = ''
}: {
  wait?: boolean;
  path?: string;
  encode?: string;
  linefeed?: NlTypes;
  title?: string;
  tab?: number;
  history?: string;
  modify?: EditModify;
  saveenc?: string;
  savelf?: NlTypes;
  k?: string;
}): void => {
  const cmd = wait ? '*edit' : '*ppe';
  const create = path ? '-new' : '';
  const enc = _getEncode(encode);
  const lf = ['crlf', 'cr', 'lf'].indexOf(linefeed) !== -1 ? `-${linefeed}` : '-crlf';
  const tw = `-tab:${tab}`;
  title = title ? `*setcaption ${title}` : '';
  const editmode = _getEditmode(history, modify, saveenc, savelf);
  const postCmd = [title, editmode, k].removeEmpty();

  if (postCmd.length > 0) {
    k = `-k %(${postCmd.join('%:')}%)`;
  }

  const cmdline = [cmd, create, enc, lf, tw, path, k].removeEmpty().join(' ');

  PPx.Execute(cmdline);
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
  let postcmd = '';

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
  }

  return resp;
};

/** @deprecated */
// @ts-ignore
export const stdout = ({cmdline, extract = false, startmsg = false, hide = false, utf8 = true, single, multi}: Stdout): Level_String => {
  const def = hide ? '-noppb -hide' : '-min';
  const msg = startmsg ? '' : '-nostartmsg';
  const opts = [def, msg].join(' ');

  if (extract) {
    cmdline = PPx.Extract(cmdline);
  }

  const data = PPx.Extract(`%*run(${opts} %(${cmdline}%))`);
  const errorlevel = Number(PPx.Extract());

  return [errorlevel, data];
};

type Stdout = {
  cmdline: string;
  wd?: string;
  extract?: boolean;
  startmsg?: boolean;
  hide?: boolean;
  utf8?: boolean;
  trim?: boolean;
  single?: string;
  multi?: string[];
};

const _setStdin = (s?: string, m?: string[]): string => {
  if (s) {
    return `-io:string,"${s}"`;
  } else if (m) {
    return `-io:send,"${m.join('%bl')}"`;
  }

  return '';
};

export const runStdout = ({
  cmdline,
  wd,
  extract = false,
  startmsg = false,
  hide = false,
  utf8 = false,
  trim = false,
  single,
  multi
}: Stdout): Level_String => {
  const def = hide ? '-noppb -hide' : '-min';
  const msg = startmsg ? '' : '-nostartmsg';
  const dir = wd ? `-d:${wd}` : '';
  const enc = utf8 ? '-io:utf8' : '';
  const stdin = _setStdin(single, multi);
  const opts = [def, msg, dir, enc, stdin].join(' ');

  if (!extract) {
    cmdline = `%(${cmdline}%)`;
  }

  let data = PPx.Extract(`%OC %*run(${opts} ${cmdline})`);
  const errorlevel = Number(PPx.Extract());

  if (trim && !isEmptyStr(data)) {
    data = data.trim();
  }

  return [errorlevel, data];
};
