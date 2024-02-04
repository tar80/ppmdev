import type {NlCodes, FileEncode, Error_String, Level_String} from '@ppmdev/modules/types.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isCV8, expandNlCode} from '@ppmdev/modules/util.ts';
import {info, tmp} from '@ppmdev/modules/data.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {newline} from '@ppmdev/modules/meta.ts';

/**
 * Hub to get streams.
 * @return [error, "error message"|"file contents"]
 */
const exec = (st: ADODB.Stream | Scripting.TextStream, callback: Function): Error_String => {
  try {
    const data = callback() ?? '';
    return [false, data];
  } catch (err) {
    return [true, ''];
  } finally {
    st.Close();
  }
};

/**
 * Reads the file and returns the contents.
 * @return [error, "file contents"|"error message"]
 * @param enc [default:"utf8"] "sjis"|"utf16le"|"utf8"
 */
export const read = ({path, enc = 'utf8'}: {path: string; enc?: FileEncode}): Error_String => {
  if (!fso.FileExists(path)) {
    return [true, `${path} not found`];
  }

  const f = fso.GetFile(path);

  if (f.Size === 0) {
    return [true, `${path} has no data`];
  }

  let [error, data] = [false, ''];

  if (enc === 'utf8') {
    const st = PPx.CreateObject('ADODB.Stream');

    [error, data] = exec(st, () => {
      st.Open();
      // st.Type = 2;
      st.Charset = 'UTF-8';
      st.LoadFromFile(path);

      return st.ReadText(-1);
    });
  } else {
    const tristate = enc === 'utf16le' ? -1 : 0;
    const st = f.OpenAsTextStream(1, tristate);

    [error, data] = exec(st, () => st.ReadAll());
  }

  return error ? [true, `Unable to read ${path}`] : [false, data];
};

type FileContents = {lines: string[]; nl: NlCodes};

/**
 * Read lines from a file.
 * @param path Read file
 * @param enc [default:"utf8"] "sjis"|"utf16le"|"utf8"
 * @param linefeed "\r\n"|"\r"|"\n"
 * @return [error, "error message"|{lines: file contents, nl: newline code}]
 */
export const readLines = ({
  path,
  enc = 'utf8',
  linefeed
}: {
  path: string;
  enc?: FileEncode;
  linefeed?: NlCodes;
}): [boolean, string | FileContents] => {
  const [error, stdout] = read({path, enc});

  if (error) {
    return [true, stdout];
  }

  linefeed = linefeed ?? expandNlCode(stdout.slice(0, 1000));
  const lines = stdout.split(linefeed);

  if (isEmptyStr(lines[lines.length - 1])) {
    lines.pop();
  }

  return [false, {lines, nl: linefeed}];
};

type WriteLines = {
  path: string;
  data: string[];
  enc?: FileEncode;
  append?: boolean;
  overwrite?: boolean;
  linefeed?: NlCodes;
};

/**
 * Write lines to a file.
 * @param enc [default:"utf8"] "sjis"|"utf16le"|"utf8"
 * @param append [default:false]
 * @param overwrite [default:false]
 * @param linefeed [default:"\r\n"]
 * @return [error, error message]
 */
export const writeLines = ({
  path,
  data,
  enc = 'utf8',
  append = false,
  overwrite = false,
  linefeed = info.nlcode
}: WriteLines): Error_String => {
  if (!overwrite && !append && fso.FileExists(path)) {
    return [true, `${path} already exists`];
  }

  const wd = fso.GetParentFolderName(path);

  if (!fso.FolderExists(wd)) {
    PPx.Execute(`*makedir ${wd}`);
  }

  let error;

  if (enc === 'utf8') {
    if (isCV8()) {
      const data_ = data.join(linefeed);
      const method = append ? 'AppendAllText' : 'WriteAllText';

      // @ts-ignore
      return [false, NETAPI.System.IO.File[method](path, data_)];
    }

    const mode = overwrite || append ? 2 : 1;
    const st = PPx.CreateObject('ADODB.Stream');
    [error] = exec(st, () => {
      st.Open();
      st.Charset = 'UTF-8';
      st.LineSeparator = Number(newline.Ascii[linefeed]);

      if (append) {
        st.LoadFromFile(path);
        st.Position = st.Size;
        st.SetEOS;
      } else {
        st.Position = 0;
      }

      st.WriteText(data.join(linefeed), 1);
      st.SaveToFile(path, mode);
    });
  } else {
    const mode = append ? 8 : overwrite ? 2 : 1;

    if (!fso.FileExists(path)) {
      PPx.Execute(`%Osq *makefile ${path}`);
    }

    const f = fso.GetFile(path);
    const tristate = enc === 'utf16le' ? -1 : 0;
    const st = f.OpenAsTextStream(mode, tristate);

    [error] = exec(st, () => {
      st.Write(data.join(linefeed) + linefeed);
    });
  }

  return error ? [true, `Could not write to ${path}`] : [false, ''];
};

/**
 * Run shell command and get stdout.
 * @return [ExitCode, stdout]
 * @param wd Working directory
 * @param cmd Shell command and options
 * @param enc File Encoding. "sjis"|"utf16le"|"utf8"
 */
export const stdout = ({cmd, enc = 'utf8', wd = ''}: {cmd: string; enc?: FileEncode; wd?: string}): Level_String => {
  const shell = PPx.CreateObject('WScript.Shell');
  const ppb = PPx.Extract('%0%\\ppbw.exe');
  wd = isEmptyStr(wd) ? wd : `*cd ${wd}%:`;
  const exitcode = shell.Run(`${ppb} -c ${wd}${cmd}> ${tmp().stdout} 2>&1`, 0, true);
  const path = tmp().stdout;
  const [error, contents] = read({path, enc});

  return [error ? 4 : exitcode, contents];
};
