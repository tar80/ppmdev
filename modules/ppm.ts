import type {Level_String, ErrorLevel} from '@ppmdev/modules/types.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr, isError} from '@ppmdev/modules/guard.ts';
import {info, uniqName, uniqID} from '@ppmdev/modules/data.ts';
import {readLines} from '@ppmdev/modules/io.ts';

type StringValues = 'e' | 'i' | 'p' | 'u';
type StringExpandValues = 'ge' | 'gi' | 'gp' | 'gu';
type StringAllValues = StringValues | StringExpandValues;
type ChoiceType = 'Ync' | 'yNc' | 'ynC';

// valid prefixes for property IDs
const rgxId = /^([ABCEFHKMPSVX][BCEVTt]?_|_[CPSUWo]|Mes)/;
const rejectInvalidString = (rgx: RegExp, value: string): ErrorLevel => {
  if (value.indexOf('@') === 0) {
    value = PPx.Extract(value).substring(1);

    if (!fso.FileExists(value)) {
      // ERROR_FILE_NOT_FOUND
      return 2;
    }
  } else if (!rgx.test(value)) {
    // ERROR_INVALID_DATA
    return 13;
  }

  // NO_ERROR
  return 0;
};

const dialog = (type: 'I' | 'Q', title = '', message: string): boolean => {
  title = isEmptyStr(title) ? '' : `/${title}`;

  return PPx.Execute(`%"ppm${title}" %OC %${type}"${message}"`) === 0;
};

// @ts-ignore - NOTE: Scheduled to be deleted when ppm-test update
const runPPmTest = (): boolean => typeof ppm_test_run !== 'undefined' && ppm_test_run <= 2;
const hasTargetId = (id: string): boolean => id !== '.';

/** Cache of ppm global properties */
const cache: Record<string, string> = {lang: info.language};

/** Create a cache of ppm global constants and return the value */
const createCache = (key: string): string => {
  const value = PPx.Extract(`%*getcust(S_ppm#global:${key})`);
  cache[key] = value;

  return value;
};

/** register temporary keys and return the command line for the input post command */
const autoselectEnter = (cmdline: string): string => {
  PPx.Execute(
    `%OC *setcust ${uniqID.tempKey}:ENTER,*if -1==%%*sendmessage(%%N-L,392,0,0)%%:%%K"@DOWN"%bn%bt%%K"@ENTER"`
  );
  PPx.Execute(
    `%OC *setcust ${uniqID.tempKey}:\\ENTER,*if -1==%%*sendmessage(%%N-L,392,0,0)%%:%%K"@DOWN"%bn%bt%%K"@ENTER"`
  );

  return `*mapkey use,${uniqID.tempKey}%%:${cmdline}`;
};

export const msgBox = (title: string, message: string) => {
  dialog('I', `${title}`, `${message}`);
};

export const ppm = {
  /** Display message in a dialog.
   * @return Whether the dialog was successfully closed
   * @param errorlevel - Optionally appends the error level to the end of the message
   */
  echo(title: string, message: string, errorlevel?: number): boolean {
    const tail = errorlevel ? `(${String(errorlevel)})` : '';
    return dialog('I', `${title}`, `${message}${tail}`);
  },

  /** Display an question dialog. */
  question(title: string, message: string): boolean {
    return dialog('Q', `${title}`, message);
  },

  /** Displays questions and answers and asks for choices. */
  choice(
    ppxid: string,
    title: string,
    message: string,
    type: ChoiceType = 'ynC',
    yes?: string,
    no?: string,
    cancel?: string
  ): (typeof answer)[typeof code] {
    const tblId = 'Mes0411';
    const mes = {'yes': `${tblId}:IMYE`, 'no': `${tblId}:IMNO`, 'cancel': `${tblId}:IMTC`};
    const isSelfId = ppxid === '.';
    const loadcust = isSelfId ? '%K"@LOADCUST"' : '%%K"@LOADCUST"';
    let [imye, imno, imtc]: string[] = [];
    let [y, n, c] = ['', '', ''];
    let load = false;

    if (!!yes) {
      imye = PPx.Extract(`%*getcust(${mes.yes})`);
      y = `*setcust ${mes.yes}=${yes}%:`;
      load = true;
    }

    if (!!no) {
      imno = PPx.Extract(`%*getcust(${mes.no})`);
      n = `*setcust ${mes.no}=${no}%:`;
      load = true;
    }

    if (!!cancel) {
      imtc = PPx.Extract(`%*getcust(${mes.cancel})`);
      c = `*setcust ${mes.cancel}=${cancel}%:`;
      load = true;
    }

    if (load) {
      PPx.Execute(`${y}${n}${c}`);
      ppm.execute(ppxid, loadcust);
    }

    type Code = keyof typeof answer;
    const answer = {'0': 'cancel', '1': 'yes', '2': 'no'} as const;
    const id = isSelfId ? '' : ppxid;
    const code = PPx.Extract(
      `%OCP %*extract(${id}"%%*choice(-text""${message}"" -title:""${title}"" -type:${type})")`
    ) as Code;

    if (load) {
      !!imye && PPx.Execute(`*setcust ${mes.yes}=${imye}`);
      !!imno && PPx.Execute(`*setcust ${mes.no}=${imno}`);
      !!imtc && PPx.Execute(`*setcust ${mes.cancel}= ${imtc}`);
      ppm.execute(ppxid, loadcust);
    }

    return answer[code];
  },

  /**
   * Wrapper PPx.Execute.
   * @param ppxid - ID|"."|"tray" `period` means current PPx
   * @param command - PPx ex command line
   * @param wait - Wait for command to finish
   */
  execute(ppxid: string, command: string, wait = false): ErrorLevel {
    if (isEmptyStr(command)) {
      return 1;
    }

    if (runPPmTest()) {
      // @ts-ignore - NOTE: Scheduled to be deleted when ppm-test update
      return ppm_test_run === 2 && PPx.Execute(`*execute B,*linemessage %%bx1b[2F[Execute] ${ppxid},%(${command}%)`);
    } else if (ppxid === 'tray') {
      return PPx.Execute(`*pptray -c ${command}`);
    } else {
      if (hasTargetId(ppxid)) {
        return wait
          ? Number(PPx.Extract(`%*extract(${ppxid},"${command}%%:0")`))
          : PPx.Execute(`*execute ${ppxid},${command}`);
      } else {
        return PPx.Execute(command);
      }
    }
  },

  /**
   * Wrapper PPx.Execute synchronously.
   * @param ppbid
   * @param command - PPx ex command line
   */
  execSync(ppbid: string, command: string): ErrorLevel {
    if (isEmptyStr(command)) {
      return 1;
    }

    if (runPPmTest()) {
      // @ts-ignore - NOTE: Scheduled to be deleted when ppm-test update
      return ppm_test_run === 2 && PPx.Execute(`*execute B,*linemessage %%bx1b[2F[Execute] ${ppbid},%(${command}%)`);
    }

    if (ppbid.length === 1) {
      ppbid = `b${ppbid}`;
    } else if (ppbid.toUpperCase().indexOf('B') !== 0) {
      return 6;
    }

    if (isEmptyStr(PPx.Extract(`%N${ppbid}`))) {
      return 6;
    }

    return Number(PPx.Extract(`%*extract(${ppbid.toUpperCase()},"${command}%%:%%*exitcode")`));
  },

  /**
   * Wrapper PPx.Extract.
   * @return [`errorlevel`, `value`]
   * @param ppxid - ID or "." `period` means current PPx
   * @param value - Expand `%macro`
   */
  extract(ppxid: string, value: string): Level_String {
    if (isEmptyStr(value)) {
      return [13, ''];
    }

    const data = hasTargetId(ppxid) ? PPx.Extract(`%*extract(${ppxid},"${value}")`) : PPx.Extract(value);
    const errorlevel = Number(PPx.Extract());

    return [errorlevel, data];
  },

  /** Language use in ppm. */
  lang(): typeof lang {
    type SystemLanguage = typeof lang;
    let lang = cache['lang'] as 'en' | 'jp';

    if (!isEmptyStr(lang)) {
      return lang;
    }

    const useLanguage = PPx.Extract('%*getcust(S_ppm#global:lang)') as SystemLanguage;
    lang = useLanguage === 'en' || useLanguage === 'jp' ? useLanguage : info.language;
    cache['lang'] = lang;
    return lang;
  },

  /**
   * Expand the value of S:_ppm#global:subid.
   * @return A value or an empty-string
   */
  global(subid: string) {
    let value = cache[subid];

    if (value) {
      return value;
    }

    if (/^ppm[ahrcl]?/.test(subid)) {
      value = PPx.Extract(`%sgu'${subid}'`);

      if (isEmptyStr(value)) {
        const name = subid.replace('ppm', '');
        switch (name) {
          case '':
            value = cache['ppm'] ?? PPx.Extract('%*getcust(S_ppm#global:ppm)');
            break;
          case 'home':
            value = cache['home'] ?? PPx.Extract('%*getcust(S_ppm#global:home)');
            break;
          case 'lib':
            {
              const ppmDir = cache['ppm'] ?? createCache('ppm');
              value = `${ppmDir}\\dist\\lib`;
            }
            break;
          default: {
            const ppmHome = cache['home'] ?? createCache('home');

            if (name === 'cache') {
              value = `${ppmHome}\\${uniqName.cacheDir()}`;
            }
          }
        }
      }
    } else {
      value = PPx.Extract(`%*getcust(S_ppm#global:${subid})`);
    }

    cache[subid] = value;
    return value;
  },

  /** Expand the value of S_ppm#user:`subid`. */
  user(subid: string): string {
    return PPx.Extract(`%*extract("%%*getcust(S_ppm#user:${subid})")`);
  },

  /** Set S_ppm#user:`subid`=`value`. */
  setuser(subid: string, value: string): ErrorLevel {
    if (isEmptyStr(value)) {
      return 1;
    }

    return PPx.Execute(`*setcust S_ppm#user:${subid}=${value}`);
  },

  /** Expand %\*name(`format`, "`filename`"[, "`path`"]). */
  getpath(format: string, filename: string, path: string = ''): Level_String {
    const rgxName = /^[CXTDHLKBNPRVSU]+$/;
    let errorlevel = rejectInvalidString(rgxName, format);

    if (errorlevel !== 0) {
      return [errorlevel, ''];
    }

    if (isEmptyStr(filename)) {
      return [1, ''];
    }

    const pathspec = !isEmptyStr(path) ? `,"${path}"` : '';
    const value = PPx.Extract(`%*name(${format},"${filename}"${pathspec})`);
    errorlevel = Number(PPx.Extract());

    return [errorlevel, value];
  },

  /** Expand the value of %\*getcust(`prop`). */
  getcust(prop: string): Level_String {
    if (isEmptyStr(prop)) {
      return [1, ''];
    }

    let errorlevel = rejectInvalidString(rgxId, prop);

    if (errorlevel !== 0) {
      return [errorlevel, ''];
    }

    const value = PPx.Extract(`%*getcust(${prop})`);

    return [errorlevel, value];
  },

  /** Set the property `prop`. */
  setcust(prop: string, multiline: boolean = false): ErrorLevel {
    if (isEmptyStr(prop)) {
      return 1;
    }

    let errorlevel = rejectInvalidString(rgxId, prop);

    if (errorlevel !== 0) {
      return errorlevel;
    }

    const opt = multiline ? '%OC ' : '';

    return PPx.Execute(`${opt}*setcust ${prop}`);
  },

  /**
   * Delete the property id[:subid].
   * @param subid - "subid" or `false` skipped
   * @param load - Run LOADCUST or not
   */
  deletecust(id: string, subid?: string | number | false, load?: boolean): ErrorLevel {
    const skipSubId = typeof subid === 'boolean';
    const rgx = /^\s*"?([^"\s]+)"?\s*?$/;
    let id_ = id.replace(rgx, '$1');
    let subid_ = String(subid);

    let errorlevel = rejectInvalidString(rgxId, id_);

    if (errorlevel !== 0) {
      return errorlevel;
    }

    const prop =
      subid != null && !skipSubId && !isEmptyStr(subid_)
        ? `${id_},${typeof subid === 'string' ? `"${subid.replace(rgx, '$1')}"` : `${subid}`}`
        : `"${id_}"`;

    PPx.Execute(`*deletecust ${prop}`);

    if (load) {
      PPx.Execute('%K"loadcust"');
    }

    return 0;
  },

  /**
   * Set temporary key.
   * @return Temporary key table name
   */
  setkey(subid: string, value: string, multiline = false, desc = ''): string {
    if (isEmptyStr(subid)) {
      throw new Error('SubId not specified');
    }

    if (!isEmptyStr(desc)) {
      desc = `*skip ${desc}%bn%bt`;
      multiline = true;
    }

    const opt = multiline ? '%OC ' : '';
    PPx.Execute(`${opt}*setcust ${uniqID.tempKey}:${subid},${desc}${value}`);

    return uniqID.tempKey;
  },

  /** Delete a temporary menu. */
  deletemenu(): void {
    PPx.Execute(`*deletecust "${uniqID.tempMenu}"`);
  },

  /** Delete temporary keys. */
  deletekeys(): void {
    PPx.Execute(`*deletecust "${uniqID.tempKey}"`);
  },

  /** Set linecust. */
  linecust({
    label,
    id,
    sep = '=',
    value = '',
    esc = false,
    once = false
  }: {
    label: string;
    id: string;
    sep: string;
    value?: string;
    esc?: boolean;
    once?: boolean;
  }): void {
    const oneshot = once ? `*linecust ${label},${id},%%:` : '';

    if (!isEmptyStr(value) && esc) {
      value = `%(${value}%)`;
    }

    PPx.Execute(`*linecust ${label},${id}${sep}${oneshot}${value}`);
  },

  /**
   * Expand the special environment variables on specified PPx[ID].
   * @param type - "[g]e"|"[g]i"|"[g]p"|"[g]u"
   */
  getvalue(ppxid: string, type: StringAllValues, key: string): Level_String {
    if (isEmptyStr(key)) {
      return [1, ''];
    }

    const value = hasTargetId(ppxid)
      ? PPx.Extract(`%*extract(${ppxid},"%%s${type}'${key}'")`)
      : PPx.Extract(`%s${type}'${key}'`);
    const errorlevel = isEmptyStr(value) ? 13 : 0;

    return [errorlevel, value];
  },

  /**
   * Set the special environment variables on specified PPx[ID].
   * @param type - "e"|"i"|"p"|"u"
   */
  setvalue(ppxid: string, type: StringValues, key: string, value: string): ErrorLevel {
    if (isEmptyStr(key)) {
      return 1;
    }

    return hasTargetId(ppxid)
      ? PPx.Execute(`*execute ${ppxid},*string ${type},${key}=${value}`)
      : PPx.Execute(`*string ${type},${key}=${value}`);
  },

  /** Calls the input-bar and returns the input string.
   * @return [errorlevel, "input string"]
   */
  getinput({
    message = '',
    title = '',
    mode = 'g',
    select = 'a',
    multi = false,
    leavecancel = false,
    forpath = false,
    fordijit = false,
    autoselect = false,
    k = ''
  }): Level_String {
    const rgxMode = /^[gnmshdcfuxeREOUX][gnmshdcfuxeSUX,]*$/;
    const m = multi ? ' -multi' : '';
    const l = leavecancel ? ' -leavecancel' : '';
    const fp = forpath ? ' -forpath' : '';
    const fd = fordijit ? ' -fordijit' : '';

    if (autoselect) {
      k = autoselectEnter(k);
    }

    const k_ = k !== '' ? ` -k %%OP- ${k}` : '';

    let errorlevel = rejectInvalidString(rgxMode, mode);

    if (errorlevel !== 0) {
      return [errorlevel, ''];
    }

    const input = PPx.Extract(
      `%OCP %*input("${message}" -title:"${title}" -mode:${mode} -select:${select}${m}${l}${fp}${fd}${k_})`
    );
    errorlevel = Number(PPx.Extract());
    this.deletemenu();
    this.deletekeys();

    return [errorlevel, input];
  },

  /**
   * Show message.
   * @param status Display in StatusLine
   * @param multi Allow multiple lines
   */
  linemessage(ppxid: string, message: string | string[], status?: boolean, multi?: boolean): void {
    const onppb = PPx.Extract('%n').substring(0, 1) === 'B';
    let msg: string;

    if (typeof message === 'object') {
      const nl = '%%bn';
      const sep = multi ? nl : ' ';
      msg = message.join(sep);
    } else {
      msg = message;
    }

    ppxid = ppxid === '.' ? '' : ppxid;
    msg = status && !onppb ? `!"${msg}` : msg;
    PPx.Execute(`%OC *execute ${ppxid},*linemessage ${msg}`);
  },

  /** Display message in LogWindow */
  report(message: string | string[]): void {
    const msg = typeof message === 'string' ? message : message.join(info.nlcode);
    PPx.Extract('%n').indexOf('B') === 0 ? PPx.linemessage(msg) : PPx.report(msg);
  },

  /** Closes the specified ID of PPx. */
  close(ppxid: string): void {
    PPx.Execute(`*closeppx ${ppxid}`);
  },

  /**
   * Job.
   * @return () => ppm.execute(`ppxid`, '*job end')
   */
  jobstart(ppxid: string): Function {
    ppm.execute(ppxid, '*job start');

    return () => ppm.execute(ppxid, '*job end');
  },

  getVersion(path: string): string | void {
    path = `${path}\\package.json`;
    const [error, data] = readLines({path});

    if (!isError(error, data)) {
      const rgx = /^\s*"version":\s*"([0-9\.]+)"\s*,/;

      for (let i = 2, k = data.lines.length; i < k; i++) {
        if (~data.lines[i].indexOf('"version":')) {
          return data.lines[i].replace(rgx, '$1');
        }
      }
    }

    return;
  }
} as const;
