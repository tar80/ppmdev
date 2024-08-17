import {execSync} from 'node:child_process';
import fs from 'node:fs';
import {info} from '@ppmdev/modules/data.ts';
import type {Error_String, FileEncode, Level_String, NlCodes} from '@ppmdev/modules/types.ts';
import {expandNlCode} from '@ppmdev/modules/util.ts';
import iconv from 'iconv-lite';

export const read = ({path, enc = 'utf8'}: {path: string; enc?: FileEncode}): Error_String => {
  if (!fs.existsSync(path)) {
    return [true, `${path} not found`];
  }

  const f = fs.statSync(path);

  // @ts-ignore
  if (f.size === 0) {
    return [true, `${path} has no data`];
  }

  let resp: string;

  try {
    if (enc !== 'utf8') {
      const raw = fs.readFileSync(path);
      resp = iconv.decode(raw, enc);
    } else {
      resp = fs.readFileSync(path, enc);
    }
  } catch (err) {
    return [true, `Unable to read ${path}`];
  }

  return [false, resp];
};
type FileContents = {lines: string[]; nl: NlCodes};
export const readLines = ({path, enc = 'utf8'}: {path: string; enc?: FileEncode}): [boolean, string | FileContents] => {
  const [error, stdout] = read({path, enc});

  if (error) {
    return [true, stdout];
  }

  const nl: NlCodes = expandNlCode(stdout.slice(0, 1000));
  const lines = stdout.split(nl);

  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return [false, {lines, nl}];
};
type WriteLines = {
  path: string;
  data: string[];
  enc?: FileEncode;
  append?: boolean;
  overwrite?: boolean;
  linefeed?: NlCodes;
};
export const writeLines = ({
  path,
  data,
  enc = 'utf8',
  append = false,
  overwrite = false,
  linefeed = info.nlcode
}: WriteLines): Error_String => {
  if (!overwrite && !append && fs.existsSync(path)) {
    return [true, `${path} already exists`];
  }

  const method = append ? 'appendFileSync' : 'writeFileSync';
  const data_ = data.join(linefeed);

  try {
    if (enc !== 'utf8') {
      fs[method](path, iconv.encode(data_, enc));
    } else {
      fs[method](path, data_);
    }
  } catch (err) {
    return [true, `Could not write to ${path}`];
  }

  return [false, ''];
};
export const stdout = ({cmd, enc = 'utf8', wd = ''}: {cmd: string; enc?: FileEncode; wd?: string}): Level_String => {
  const tmp = fs.mkdtempSync(process.env.temp + '\\nodejs');
  const stdOut = `${tmp}\\_stdout`;
  const opts = wd !== '' ? {cwd: wd} : {};
  execSync(`${cmd}> ${stdOut} 2>&1`, opts);

  let f = fs.statSync(stdOut);
  let exitcode = 0;
  let path = stdOut;

  if (f.size === 0) {
    return [128, 'Not data'];
  }

  const [error, stdout] = read({path, enc});
  fs.rmSync(tmp, {recursive: true, force: true});

  return [error ? 4 : exitcode, stdout];
};
