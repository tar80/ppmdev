/* NOTE: this files is not module for ppm.
 * Used to override global:PPx object at jest runtime.
 */
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

class DummyArguments {
  num: number = 1;

  constructor(arg?: number) {
    this.num = arg || this.num;
  }
  Count() {
    return process.argv.length;
  }
  Length() {
    return process.argv.length;
  }
  Item() {
    return process.argv[this.num] || '';
  }
}

const fso = {
  BuildPath: (filepath: string, arg: string): string => `${filepath}\\${arg}`,
  FileExists: (filepath: string): boolean => {
    try {
      const stats = fs.statSync(filepath);

      return stats.isFile();
    } catch (err: any) {
      return false;
    }
  },
  FolderExists: (filepath: string): boolean => {
    try {
      const stats = fs.statSync(filepath);

      return stats.isDirectory();
    } catch (err: any) {
      return false;
    }
  },
  GetFile: (filepath: string): object => fs.statSync(filepath),
  GetParentFolderName: (filepath: string): string => path.dirname(filepath),
};

const dummyActivex = (obj: string): any => {
  if (obj === 'Scripting.FileSystemObject') {
    return fso;
  }
};

const PPx = {
  PPxVersion: 19400,
  ModuleVersion: 20,
  CodeType: 1,
  DirectoryType: 0,
  ScriptEngineName: 'JScript',
  ScriptName: __dirname + '\\jest-mock.js',
  //FIXME! wakarimasen
  Arguments: (num?: number): any => new DummyArguments(num),
  //FIXME! nanimowakarimasen
  CreateObject: (strProgID: string, strPrefix?: string): ActiveXObject => {
    strPrefix;

    return dummyActivex(strProgID);
  },
  Echo: (message: string): void => {
    console.log(message);
  },
  Extract: (param?: string): string => {
    const ppb = `${process.env.PPX_DIR}\\ppbw.exe`;
    param = param ?? '';
    // param = param.includes('%') ? param : `%*extract(CA,"${param.replace('%', '%%')}")`;
    let stdout = execSync(`${ppb} -c *maxlength 2000%:%OC *stdout " ${param}"`);

    return stdout.toString().substring(1);
  },
  Execute: (param: string): number => {
    /* Normally cancel the operation. Mock if you need to check the operation
    import {execSync} from 'child_process';
    let spy = jest.spyOn(PPx, 'Execute').mockImplementation((param) => {
      const ppc = `${process.env.PPX_DIR}\\ppcw.exe`;
      execSync(`${ppc} -bootid:p -noactive -r -k ${param}`);
      return 0;
    });
    */
    const _ = param;

    return Number(0);
  },
  setValue: (key: string, value: string | number): void => {
    PPx.Execute(`*string p,${key}=${value}`);
  },
  Quit: (exitcode: number = 1): void => console.log(`PPx.Quit(${exitcode})`)
} as PPx;

export default PPx;
