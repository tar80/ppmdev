import '@ppmdev/polyfills/json.ts';
import '@ppmdev/polyfills/objectKeys.ts';
import type {Error_String} from '@ppmdev/modules/types.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {colorlize} from '@ppmdev/modules/ansi.ts';
import {semver} from '@ppmdev/modules/util.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import {expandSource} from '@ppmdev/modules/source.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';

const pass = colorlize({esc: false, message: ' PASS ', fg: 'green'});
const drop = colorlize({esc: false, message: ' DROP ', fg: 'red'});
const failedItem = (message: string): string => colorlize({esc: true, message: message, fg: 'yellow'});
const result = (error: boolean, message: string): Error_String =>
  error ? [true, `${drop} ${message}`] : [false, `${pass} ${message}`];

let libDir: string;
export const useSelfLibDir = (path: string): void => {
  libDir = path;
};

/**
 * Checks the existence of some specified items.
 * @return [ok, "missing items separated by commas"]
 */
export const existence = (scriptname: string, header: string, items: string | string[]): Error_String => {
  items = typeof items === 'string' ? items : items.join(',');

  // There are no items to check
  if (isEmptyStr(items)) {
    return result(false, `${header}: There are no items`);
  }

  // Note that S_global#global:ppm is unset when installing ppm itself.
  libDir = libDir ?? ppm.global('ppmlib');
  const scriptPath = `${libDir}\\${scriptname}.js`;

  if (!fso.FileExists(scriptPath)) {
    return result(true, `${header}: ${scriptPath.replace(/\\/g, '/')} is not found`);
  }

  const [errorlevel, resp] = ppm.extract('.', `%*script(${scriptPath},${items})`);

  if (errorlevel !== 0) {
    return result(true, `${header}: An error has occurred(${errorlevel})`);
  }

  const list: {[key in (typeof items)[number]]: boolean} = JSON.parse(resp);
  let error = false;
  let checkedItems: string[] = [];

  for (let item of Object.keys(list)) {
    if (!list[item]) {
      error = true;
      item = failedItem(item);
    }

    checkedItems.push(item);
  }

  const m = `${header}: ${checkedItems.join(', ')}`;

  return result(error, m);
};

export type PermissionItems = {
  readonly ppmVersion?: string | number;
  readonly ppxVersion: string | number;
  readonly scriptVersion: string | number;
  readonly scriptType: string | number;
  readonly codeType: string | number;
  readonly libRegexp?: string;
  readonly useModules: string | string[];
  readonly useExecutables: string | string[];
  readonly dependencies?: string;
  // readonly copyFlag?: string;
  // readonly copyScript?: string;
  // readonly copySpec?: string;
};

export const permission = {
  /** plugin version limit. */
  pluginVersion: (version: number | string, name: string): Error_String => {
    const pluginDetail = expandSource(name);
    const m: Record<string, string> = {'false': `${name} version ${version}`, 'true': `${name} has not been updated}`};

    // not installed
    if (!pluginDetail) {
      return result(false, m['false']);
    }

    const current = semver(pluginDetail.version);
    const newVersion = semver(version);
    const error = current >= newVersion;

    return result(error, m[error.toString()]);
  },

  /** ppm version limit. */
  ppmVersion: (limit: number | string): Error_String => {
    const current = semver(ppm.global('version'));
    const lower = semver(limit);
    const m = `ppx-plugin-manager version ${limit} or later`;

    return result(current < lower, m);
  },

  /** PPx version limit. */
  ppxVersion: (limit: string | number): Error_String => {
    limit = Number(limit);
    const current = PPx.PPxVersion;
    const lower = limit < 1000 ? limit * 100 : limit;
    const m = `PPx version ${lower} or later`;

    return result(current < lower, m);
  },

  /** Script Module version limit. */
  scriptVersion: (lower: string | number): Error_String => {
    const current = PPx.ModuleVersion;
    const m = `ScriptModule R${lower} or later`;

    return result(current < Number(lower), m);
  },

  /** JScript version limit. */
  scriptType: (limit: string | number): Error_String => {
    limit = Number(limit);
    const currentType = PPx.ScriptEngineName === 'ClearScriptV8' ? 5 : Number(PPx.Extract('%*getcust(_others:usejs9)'));
    const version = ['anything', 'JS9(5.7)', 'JS9(5.8)', 'JS9(ES5)', 'Chakra(ES6)', 'CV8(ESNEXT)'];
    const m = `Use JScript version ${version[limit]}`;
    let error = limit === 0 ? false : currentType !== limit;

    return result(error, m);
  },

  /** CodeType version limit. */
  codeType: (limit: string | number): Error_String => {
    limit = Number(limit);
    const codetype = PPx.CodeType;
    const version = {
      0: ['MultiByte', 'Unicode'],
      1: ['Unicode', 'MultiByte']
    };
    const using = version[codetype as 0 | 1];
    let m = `Using PPx ${using[0]}`;
    let error = limit === 0 ? false : codetype + 1 === limit;

    if (error) {
      m = `${m}. Required ${using[1]}`;
    }

    return result(error, m);
  },

  /** Regex library limit. */
  libRegexp: (limit: string): Error_String => {
    const m = 'Using bregonig.dll';

    return result(limit !== 'bregonig', m);
  },

  /** Required executables */
  useExecutables: (items: string | string[]): Error_String => existence('exeExists', 'Required executables', items),

  /** Required libraries */
  useModules: (items: string | string[]): Error_String => existence('libExists', 'Required modules', items),

  /** Items with dependencies */
  dependencies: (items: string): Error_String => [false, items]
} as const;
