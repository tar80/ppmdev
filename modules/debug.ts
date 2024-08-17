const debug = {
  logCount: 1,

  /** Display a dialog box. Canceling aborts a running script. */
  log(...args: any[]): void {
    const message = args.length > 0 ? args.join(', ') : '';
    const exitcode = PPx.Execute(`%OC %"DEBUG_LOG"%Q"[${this.logCount}] %(${String(message)}%)"`);

    if (exitcode !== 0) {
      PPx.Quit(-1);
    }

    this.logCount++;
  },

  /** Stop running script. */
  break(): never {
    return PPx.Quit(-1);
  },

  /** Check for existence of the path */
  exists(path: string, att = 'file'): void {
    const fso = PPx.CreateObject('Scripting.FileSystemObject');
    const att_ = att === 'file' ? 'FileExists' : 'FolderExists';

    debug.log(`exists: ${String(fso[att_](path))} (${path})`);
  },

  /** Wait for milliseconds. */
  wait(ms: number): void {
    PPx.Execute(`*wait ${ms},2`);
  },

  /** Function executed when debugging. **/
  func(callback: () => any): void {
    callback();
  },

  /** Returns "true" while the Jest is running. */
  jestRun(): boolean {
    return typeof process === 'object' && process.env.NODE_ENV === 'test';
  }
};

export default debug;
