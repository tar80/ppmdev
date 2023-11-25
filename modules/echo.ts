import {ErrorLevel} from '@ppmdev/modules/types.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';

/** Returns path for UNIX echo. */
export const echoExe = ((): string => {
    const gitDir = PPx.Extract('%*getcust(S_ppm#global:git)');

    return isEmptyStr(gitDir) ? 'echo' : `"${gitDir}\\usr\\bin\\echo.exe"`;
})();

export const coloredEcho = (ppbid: string, message: string): ErrorLevel => {
  const cmdline =
    ppbid === '.' ? `%OP ${echoExe} -ne '${message}'` : `*execute ${ppbid},%%OP ${echoExe} -ne '${message}'`;
  return PPx.Execute(cmdline);
};
