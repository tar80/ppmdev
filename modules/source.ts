import '@ppmdev/polyfills/arrayIndexOf.ts';
import '@ppmdev/polyfills/objectKeys.ts';
import '@ppmdev/polyfills/json.ts';
import {info} from '@ppmdev/modules/data.ts';
import {isEmptyObj, isEmptyStr} from '@ppmdev/modules/guard.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import type {Error_String} from '@ppmdev/modules/types.ts';

type SourceRequire = {
  name: string;
  version: string | number;
  location: 'remote' | 'local';
};
type SourceOptional = {
  enable?: boolean;
  setup?: boolean;
  branch?: string;
  commit?: string;
  autor?: string;
};
export type Source = SourceRequire & SourceOptional & {path: string};

const parseSource = (name: string, source: string): typeof resp => {
  const plugin: Omit<Source, 'name'> = JSON.parse(source.replace(/\\/g, '\\\\'));
  plugin.path = plugin.location === 'remote' ? `${PPx.Extract('%*getcust(S_ppm#global:home)')}\\repo\\${name}` : plugin.path;
  const resp = {name, ...plugin};

  return resp;
};

/** Expand a S_ppm#sources:`name`. */
export const expandSource = (name: string) => {
  const source = PPx.Extract(`%*getcust(S_ppm#sources:${name})`);

  return isEmptyStr(source) ? undefined : parseSource(name, source);
};

/**
 * Overwrite the specified menber of the S_ppm#sources:`name`.
 */
export const owSource = (name: string, items: Partial<Source>) => {
  let source = PPx.Extract(`%*getcust(S_ppm#sources:${name})`);

  if (isEmptyObj(items) || isEmptyStr(source)) {
    return undefined;
  }

  type key = keyof Source;
  for (const key of Object.keys(items)) {
    const rgx = RegExp(`"${key}":[^,}]+`);
    const value = typeof items[key as key] === 'boolean' ? items[key as key] : `"${items[key as key]}"`;
    source = source.replace(rgx, `"${key}":${value}`);
  }

  PPx.Execute(`*setcust S_ppm#sources:${name}=${source}`);
  const resp = parseSource(name, source);

  return resp;
};

/** Set a S_ppm#sources:`name`. */
export const setSource = ({
  name,
  enable = true,
  setup = false,
  version = '0.1.0',
  location = 'remote',
  path = '',
  branch = '',
  commit = ''
}: Source): number => {
  const value = [`"enable":${enable}`, `"setup":${setup}`, `"version":"${version}"`, `"location":"${location}"`];

  if (location === 'local') {
    if (isEmptyStr(path)) {
      throw new Error('Path not specified');
    }

    value.push(`"path":"${path}"`);
  }

  !isEmptyStr(branch) && value.push(`"branch":"${branch}"`);
  !isEmptyStr(commit) && value.push(`"commit":"${commit}"`);
  return PPx.Execute(`*setcust S_ppm#sources:${name}={${value.join(',')}}`);
};

export const sourceNames = () => {
  const list = PPx.Extract('%*getcust(S_ppm#sources)').split(info.nlcode);
  const names: string[] = [];

  for (let i = 1, k = list.length - 2; i < k; i++) {
    names.push(list[i].split(/\t/)[0]);
  }

  return names;
};

export const sourceComplistPath = `${PPx.Extract('%sgu"ppmcache"')}\\complist\\ppmsources.txt`;
export const sourceComp = {
  prefix: {installed: '!', enable: '', disable: '~'},

  /** Get plugin configuration state as prefix */
  getPrefix(source: Source): string {
    type UsageState = 'installed' | 'enable' | 'disable';
    let pf: UsageState = 'enable';

    if (!source.enable) {
      pf = 'disable';
    } else if (!source.setup) {
      pf = 'installed';
    }

    return this.prefix[pf];
  },

  /** Get the plugin name without the state prefix */
  expandName(name: string): string {
    return name.replace(/^[~!]/, '');
  },

  /** Get the name of the complete-list item */
  getName(name: string): string | undefined {
    const details = expandSource(this.expandName(name));

    if (!details) {
      return;
    }

    let prefix = this.prefix.enable;

    if (!details.enable) {
      prefix = this.prefix.disable;
    } else if (!details.setup) {
      prefix = this.prefix.installed;
    }

    return `${prefix}${name}`;
  },

  /** Fixed name prefix in plugin completion list. */
  fix(items: Source[]): Error_String {
    const [error, data] = readLines({path: sourceComplistPath});

    // when list does not exist
    if (error) {
      const candidates: string[] = [];
      for (const item of items) {
        candidates.push(`${this.getPrefix(item)}${item.name}`);
      }
      return this.write(candidates);
    }

    const rgx = /^[\!~]/;
    const o: Record<string, string> = {};

    for (const item of items) {
      o[item.name] = this.getPrefix(item);
    }

    for (let i = 0, k = data.lines.length, name: string, prefix: string | undefined; i < k; i++) {
      name = data.lines[i].replace(rgx, '');
      prefix = o[name];

      if (typeof prefix === 'string') {
        data.lines[i] = `${prefix}${name}`;
      }
    }

    return this.write(data.lines);
  },

  /**
   * Overwrite the plugin complete-list
   */
  write(data: string[], add = false): Error_String {
    const [overwrite, append] = add ? [false, true] : [true, false];
    return writeLines({path: sourceComplistPath, data, overwrite, append});
  }
};
