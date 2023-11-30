/* This code based on vim-g(https://github.com/kana/vim-g/autoload/g/branch.vim)
 * Under the MIT license
 */
import {Error_String} from '@ppmdev/modules/types.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr, isError} from '@ppmdev/modules/guard.ts';
import {read, readLines} from '@ppmdev/modules/io.ts';

export type gitCmd = {
  subcmd: string;
  wd?: string;
  noquotepath?: boolean;
  noeditor?: boolean;
  config?: string;
  opts?: string;
};
/**
 * Adjust the git command line.
 * @param subcmd Specify a git sub command correctly
 * @param wd Specify a warking directory if necessary
 * @param noquotepath Boolean. Disable quotepath
 * @param noeditor Boolean. Disable git editor
 * @param config An additional git config can be specified
 * @param opts Specify sub command options
 */
export function gitCmd({wd, noquotepath, noeditor, config, subcmd, opts}: gitCmd): string {
  if (!subcmd) {
    throw new Error('Subcmd is not specified');
  }

  const pwd = wd ?? PPx.Extract('%*name(DL,"%FD")');
  const quotepath = noquotepath ? ` -c core.quotepath=false` : '';
  const editor = noeditor ? ` -c core.editor=false` : '';
  const coreopts = !!config ? ` -c ${config}` : '';
  const subopts = !!opts ? ` ${opts}` : '';

  return `git -C "${pwd}"${quotepath}${editor}${coreopts} ${subcmd}${subopts}`;
}

/**
 * Get the root path of the git repository.
 * @param path Specify the path to check
 * @return Git repository root path
 */
export function repoRoot(path: string = ''): string {
  // ignore remote path
  let path_ = path.replace(/aux:([/\\])*[SM]_[^\\]*\\(.*)?/, (_, delim, cwd) => {
    return delim === '\\' ? cwd : '[url]';
  });

  if (path_ === '[url]') {
    return '';
  }

  path_ = isEmptyStr(path_) ? PPx.ScriptName : path_;

  if (!fso.FolderExists(path_)) {
    path_ = fso.GetParentFolderName(path_);
  }

  let repo: string;

  do {
    repo = fso.BuildPath(path_, '.git');

    if (fso.FolderExists(repo)) {
      return path_;
    }

    path_ = fso.GetParentFolderName(path_);
  } while (path_ !== '');

  return '';
}

const eventSpec = [
  {state: 'Rebase', att: 'file', parent: '/rabase-apply/rebasing', filename: '/HEAD'},
  {state: 'Am', att: 'file', parent: '/rabase-apply/applying', filename: '/HEAD'},
  {state: 'Am/Rebase', att: 'dir', parent: '/rebase-apply', filename: '/HEAD'},
  {state: 'Rebase-i', att: 'file', parent: '/rebase-merge/interactive', filename: '/rebase-merge/head-name'},
  {state: 'Rebase-m', att: 'dir', parent: '/rebase-merge', filename: '/rebase-merge/head-name'},
  {state: 'Merging', att: 'file', parent: '/MERGE_HEAD', filename: '/HEAD'}
];

const nameAndState = (root: string, filepath: string, state: string): string[] => {
  const unknown = '(unknown)';
  let [error, data] = readLines({path: filepath});

  if (isError(error, data)) {
    return [unknown, state];
  }

  if (~data.lines[0].indexOf('refs/heads/')) {
    return [data.lines[0].replace(/^(ref: )?refs\/heads\/(.+)/, '$2'), state];
  }

  let name = unknown;
  const logsHead = `${root}/logs/HEAD`;

  if (fso.FileExists(logsHead)) {
    [error, data] = readLines({path: logsHead});

    if (isError(error, data)) {
      return [unknown, state];
    }

    const lines = data.lines;

    for (let i = lines.length - 1; 0 < i; i--) {
      if (~lines[i].indexOf('checkout: moving from')) {
        name = lines[i].replace(/.*to\s(.+)$/, '$1');
        state = 'Detached';
        break;
      }
    }
  }

  return [name, state];
};

export function branchName(path: string): string[] {
  let [name, state] = ['', ''];

  if (!fso.FolderExists(path)) {
    return [name, state];
  }

  const wd = `${path}\\.git`;
  let [headSpec, headFile]: string[] = [];

  for (const v of eventSpec) {
    headSpec = `${wd}\\${v.parent}`;

    if (v.att === 'file' && fso.FileExists(headSpec)) {
      headFile = `${wd}\\${v.filename}`;

      if (fso.FileExists(headFile)) {
        [name, state] = nameAndState(wd, headFile, v.state);
        break;
      }
    } else if (v.att === 'dir' && fso.FolderExists(headSpec)) {
      headFile = `${wd}\\${v.filename}`;

      if (fso.FileExists(headFile)) {
        [name, state] = nameAndState(wd, headFile, v.state);
        break;
      }
    }

    [name, state] = nameAndState(wd, `${wd}\\HEAD`, '');
  }

  return [name, state];
}
/**
 * Get the hash of the local origin branch's HEAD
 * @param path Specify the root to the git repository
 * @return [error, "error message"|"origin HEAD hash"]
 */
export function branchHead(path: string = ''): Error_String {
  if (!fso.FolderExists(path)) {
    return [true, `${path} is not exists`];
  }

  let refs = `${path}\\.git\\HEAD`;
  let [error, head] = read({path: refs});

  if (error) {
    return [true, head];
  }

  const rgx = /^ref:\s(\S+)[\s\S]*/;

  if (~head.indexOf('ref: ')) {
    head = head.replace(rgx, '$1');
    refs = `${path}\\.git\\${head.replace(/\//g, '\\')}`;
    [error, head] = read({path: refs});

    if (error) {
      return [true, head];
    }
  }

  return [false, head.replace(/\s*$/, '')];
}
