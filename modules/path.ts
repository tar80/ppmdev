import debug from '@ppmdev/modules/debug.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {entryAttribute} from '@ppmdev/modules/meta.ts';

/** Get information about the currently running script. */
export const pathSelf = (): {scriptName: string; parentDir: string} => {
  const sn = PPx.ScriptName;
  let scriptName: string;
  let parentDir: string;

  if (~sn.indexOf('\\')) {
    scriptName = extractFileName(sn);
    parentDir = PPx.Extract(`%*name(DKN,${sn})`);
  } else {
    scriptName = sn;
    parentDir = PPx.Extract('%FDN');
  }

  /* As a general rule, no trailing backslash. */
  return {scriptName, parentDir: parentDir.replace(/\\$/, '')};
};

/** Join path with backslash separator. */
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
 * Normaline path with specified separator.
 * @param sep slash|backslash
 */
export const pathNormalize = (path: string, sep: string): string => {
  if (sep !== '\\' && sep !== '/') {
    throw new Error('Incorrect separator');
  }

  if (isEmptyStr(path)) {
    throw new Error('Path must be of type string, and not be an empty string');
  }

  return path.replace(/[/\\]/g, sep);
};

export const actualPath = (path: string): string => {
  const linkedpath = PPx.Extract(`*ifmatch "o:e,a:p","${path}"%:%*linkedpath(${path})`);

  return linkedpath || path;
};

export const actualPaths = (): string[] => {
  const paths: string[] = [];
  let att: string;

  for (const a = PPx.Entry.AllMark; !a.atEnd(); a.moveNext()) {
    att = entryAttribute.alias & PPx.Entry.Attributes ? '%*linkedpath(%FDC)' : '%FDC';
    paths.push(PPx.Extract(att));
  }

  return paths;
};

export const actualParentDirectory = (debugPath?: string): string => {
  const rgx = /^aux:(\/\/)?[MS]_[^/\\]+[/\\]/;
  let macro = PPx.DirectoryType === 4 ? '%FDVN' : '%FDN';

  if (debug.jestRun() && debugPath) {
    macro = debugPath;
  }

  return PPx.Extract(macro).replace(rgx, '');
};

export const extractFileName = (path: string, sep = '\\'): string => {
  if (sep !== '\\' && sep !== '/') {
    sep = '\\';
  }

  return path.slice(path.lastIndexOf(sep) + 1);
};
