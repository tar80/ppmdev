import {isEmptyStr} from '@ppmdev/modules/guard.ts';

/** Get information about the currently running script. */
export const pathSelf = (): {scriptName: string; parentDir: string} => {
  const sn = PPx.ScriptName;
  let scriptName: string, parentDir: string;

  if (~sn.indexOf('\\')) {
    scriptName = sn.replace(/^.*\\/, '');
    parentDir = PPx.Extract(`%*name(DKN,${sn})`);
  } else {
    scriptName = sn;
    parentDir = PPx.Extract(`%FDN`);
  }

  /* As a general rule, do not add "\\" at the end */
  return {scriptName, parentDir: parentDir.replace(/\\$/, '')};
};

/** Join path with backslash delimiter. */
export const pathJoin = (...args: string[]): string => {
  const arr: string[] = [];

  for (const arg of args) {
    if (isEmptyStr(arg)) {
      continue;
    }

    arr.push(arg);
  }

  return arr.join('\\') || '';
};

/**
 * Normaline path with specified delimiter.
 * @param delim slash|backslash
 */
export const pathNormalize = (path: string, delim: string): string => {
  if (delim !== '\\' && delim !== '/') {
    throw new Error('Incorrect delimiter');
  }

  if (isEmptyStr(path)) {
    throw new Error('Path must be of type string, and not be an empty string');
  }

  return path.replace(/[/\\]/g, delim);
};
