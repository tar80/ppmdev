/* NOTE: this files is not module for ppm.
 * Used to override global:PPx object at jest runtime.
 */
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

class DummyArguments implements PPxArguments {
  private num: number = 4;
  public length: number = process.argv.length - 4;
  public Length: number = this.length;
  public count: number = this.length;
  public Count: number = this.length;

  constructor(index?: number) {
    this.num = index || this.num;
    this.length = process.argv.length - 4
  }
  Item(int?: number): string {
    this.num = int || this.num;
    return process.argv[this.num] || '';
  }
  // static Length: number = this.length;
  atEnd(): boolean {
    return this.num === process.argv.length;
  }
  moveNext(): void {
    this.num++;
  }
  reset(): void {
    this.num = 4;
  }
  value: string = this.Item()
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
  GetParentFolderName: (filepath: string): string => path.dirname(filepath)
};

const dummyActivex = (obj: string): any => {
  if (obj === 'Scripting.FileSystemObject') {
    return fso;
  }
};

const PPx = {
  PPxVersion: 19700,
  ModuleVersion: 21,
  CodeType: 1,
  DirectoryType: 0,
  ScriptEngineName: 'JScript',
  ScriptName: __dirname + '\\this-is-jest-mock.js',
  Argument: (num = 0): string => String(process.argv[num + 4] || ''),
  //FIXME! wakarimasen
  Arguments: new DummyArguments,
  //FIXME! nanimowakarimasen
  CreateObject: (strProgID: string, strPrefix?: string): any => {
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
    let stdout = execSync(`${ppb} -c *maxlength 10000%:%OC *stdout " ${param}"%&`);

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
  /* Not checking the contents as in the actual PPx.GetFileInformation,
     Note that the extension is returned as is.
  */
  GetFileInformation: (param: string, option?: never): string => {
    let ext = path.extname(param);
    const _ = option;

    return ext === '' && fso.FolderExists(param) ? ':DIR' : `:${ext.slice(1).toUpperCase()}`;
  },
  linemessage: (text?: any): void => {
    const ppb = `${process.env.PPX_DIR}\\ppbw.exe`;
    execSync(`${ppb} -c *execute C,*linemessage ${text ?? ''}%&`);
  },
  Quit: (exitcode = 1) => {
    return console.log(`PPx.Quit(${exitcode})`) as never;
  },
  setValue: (key: string, value: string | number): void => {
    const ppb = `${process.env.PPX_DIR}\\ppbw.exe`;
    execSync(`${ppb} -c *execute C,*string p,${key}=${value}%%&`);
  }
};

export default PPx;
