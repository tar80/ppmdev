import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import type {ErrorLevel} from '@ppmdev/modules/types.ts';

/** Returns path for UNIX echo. */
export const echoExe = ((): string => {
  const gitDir = PPx.Extract('%*getcust(S_ppm#global:git)');

  return isEmptyStr(gitDir) ? 'echo' : `"${gitDir}\\usr\\bin\\echo.exe"`;
})();

export const coloredEcho = (ppbid: string, message: string, wait = false): ErrorLevel => {
  message = message.replace(/\\/g, '\\\\');
  const wait_ = wait ? 'W' : '';
  const cmdline =
    ppbid === '.' ? `%OP${wait_} ${echoExe} -ne '%(${message}%)'` : `*execute ${ppbid},%%OP${wait_} ${echoExe} -ne '%%(${message}%%)'`;

  return PPx.Execute(cmdline);
};
