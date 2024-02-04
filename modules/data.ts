const info = {
  ppmName: 'ppx-plugin-manager',
  ppmVersion: 0.93,
  language: 'jp',
  nlcode: '\r\n',
  nltype: 'crlf',
  ppmID: 'P',
  ppmSubID: 'Q'
} as const;

const useLanguage = (): 'en' | 'jp' => {
  let lang = PPx.Extract('%*getcust(S_ppm#global:lang)') as 'en' | 'jp';
  return lang === 'en' || lang === 'jp' ? lang : info.language;
};

type Mandatory = {
  readonly ppxVersion: number;
  readonly codeType: number;
  readonly scriptType: number;
  readonly scriptModule: () => number;
  readonly modules: string[];
  readonly executables: string[];
};
const mandatory: Mandatory = {
  ppxVersion: 19500,
  codeType: 2,
  scriptType: 0,
  scriptModule() {
    return PPx.ScriptEngineName === 'ClearScriptV8' ? 3 : 21;
  },
  modules: ['ppxkey', 'ppxmes', 'ppxtext'],
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
  lfDset: 'ppmlfdset'
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

export {info, useLanguage, mandatory, tmp, uri, uniqName, uniqID};
