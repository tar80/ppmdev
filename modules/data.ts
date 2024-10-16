const info = {
  ppmName: 'ppx-plugin-manager',
  ppmVersion: 0.95,
  language: 'ja',
  encode: 'utf16le',
  nlcode: '\r\n',
  nltype: 'crlf',
  ppmID: 'P',
  ppmSubID: 'Q'
} as const;

export const ppmTable = {
  actions: 'S_ppm#actions',
  event: 'S_ppm#event',
  global: 'S_ppm#global',
  sources: 'S_ppm#sources',
  staymode: 'S_ppm#staymode',
  user: 'S_ppm#user'
};

const useLanguage = (): 'en' | 'ja' => {
  let lang = PPx.Extract(`%*getcust(${ppmTable.global}:lang)`) as 'en' | 'ja';
  return lang === 'en' || lang === 'ja' ? lang : info.language;
};

type ModuleName = 'JScript' | 'ClearScriptV8' | 'QuickJS';
type Mandatory = {
  readonly ppxVersion: number;
  readonly codeType: number;
  readonly scriptType: number;
  readonly scriptModule: () => number;
  readonly modules: string[];
  readonly executables: string[];
};
const mandatory: Mandatory = {
  ppxVersion: 19900,
  codeType: 1,
  scriptType: 0,
  scriptModule() {
    const module = PPx.ScriptEngineName as ModuleName;

    return {
      JScript: 21,
      ClearScriptV8: 3,
      QuickJS: 0
    }[module];
  },
  modules: ['ppxkey', 'ppxmes', 'ppxtext', 'ppxwin'],
  executables: ['git']
};

const uniqName = {
  initialCfg: '_initial.cfg',
  globalCfg: '_global.cfg',
  nopluginCfg: '_noplugin.cfg',
  pluginList: '_pluginlist',
  manageFiles: '_managefiles',
  updateLog: '_updateLog',
  repoDir: 'repo',
  archDir: 'arch',
  cacheDir() {
    return `cache\\${PPx.Extract('%0').slice(3).replace(/\\/g, '@')}`;
  }
} as const;

const uniqID = {
  tempKey: 'K_ppmTemp',
  tempMenu: 'M_ppmTemp',
  /** @deprecated */
  lfDset: 'ppm_lfdset',
  virtualEntry: 'ppm_ve'
} as const;

const staymodeID = {
  storeData: 80000, // reservation. currently unused
  veHandler: 80001,
  setsel: 80002,
  stackPPb: 80003
} as const;

const tmp = () => {
  const parent = PPx.Extract('%*extract(C,"%%*temp()")') as 'temp\\PPXNNN.TMP\\';

  return {
    dir: parent,
    file: `${parent}_ppmtemp`,
    lf: `${parent}_temp.xlf`,
    stdout: `${parent}_stdout`,
    stderr: `${parent}_stderr`,
    ppmDir() {
      const path = PPx.Extract("%'temp'%\\ppm") as 'temp\\ppm';
      PPx.Execute(`*makedir ${path}`);

      return path;
    }
  } as const;
};

/* NOTE: As a general rule, no trailing slash. */
const uri = {
  github: 'https://github.com',
  rawGithub: 'https://raw.githubusercontent.com'
} as const;

export {info, useLanguage, mandatory, tmp, uri, uniqName, uniqID, staymodeID};
