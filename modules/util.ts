import {NlCodes} from '@ppmdev/modules/types.ts';
import debug from '@ppmdev/modules/debug.ts';

/** Extract and expand Newline code in `data`. */
export const expandNlCode = (data: string): NlCodes => {
  let nl: NlCodes = '\n';
  const indexCr = data.indexOf('\r');

  if (~indexCr) {
    nl = data.substring(indexCr, indexCr + 2) == '\r\n' ? '\r\n' : '\r';
  }

  return nl;
};

const partOfVersion = (part: string | undefined, major: boolean = false): string => {
  let part_ = '00';

  if (part) {
    part_ = part.length === 1 ? `0${part}` : part;
  }

  if (major && part_ === '00') {
    part_ = '0.';
  }

  return part_;
};

/** Semantic Versioning the `version`. */
export const semver = (version: string | number): number => {
  const s = String(version).split('.');
  s[0] = partOfVersion(s[0], true);
  s[1] = partOfVersion(s[1]);
  s[2] = partOfVersion(s[2]);

  return Number([s[0], s[1], s[2]].join(''));
};

/** Compare version information. */
export const checkUpdate = (newversion: string, oldversion: string): boolean => {
  return semver(newversion) > semver(oldversion);
};

type targetValue = unknown;

/** Waits `timeout` until `callback` returns `true`. */
export const waitUntil = (
  value: targetValue,
  callback: (value: targetValue) => boolean,
  timeout: number = 6000,
  interval: number = 300
): boolean => {
  for (let i = 0; i < timeout; i = i + interval) {
    if (callback(value)) {
      return true;
    }

    PPx.Execute('*wait 300,2');
  }

  return false;
};

/** Whether the library used by JavaScript is ClearScriptV8 */
export const isCV8 = (): boolean => PPx.ScriptEngineName === 'ClearScriptV8';

/** Whether the library used by JavaScript is QuickJS */
export const isQJS = (): boolean => PPx.ScriptEngineName === 'QuickJS';

export const actualParentDirectory = (debugPath?: string): string => {
  const rgx = /^aux:(\/\/)?[MS]_[^/\\]+[/\\]/;
  let macro = PPx.DirectoryType === 4 ? '%FDVN' : '%FDN';

  if (debug.jestRun() && debugPath) {
    macro = debugPath;
  }

  return PPx.Extract(macro).replace(rgx, '');
};

export const windowID = (): {id: string; uid: string} => {
  const id = PPx.Extract('%n');
  let uid = id.replace(/^(C)([^_]+)$/, '$1_$2');

  return {id, uid};
};

export const codeToChar = (v: string): string => {
  if (v.indexOf('x') === 0) {
    v = PPx.Extract(`%b${v}`);
  } else if (v.indexOf('u') === 0) {
    v = PPx.Extract(`%b${v.substring(1)}`);
  }

  return v;
};

export const hexToNum = (hex: string) => {
  const num = parseInt(hex, 16);

  return isNaN(num) ? undefined : num;
};

export const numToHex = (num: number) => (isNaN(num) ? undefined : num.toString(16));
