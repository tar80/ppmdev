import '@ppmdev/polyfills/arrayRemoveEmpty.ts';
import '@ppmdev/polyfills/json.ts';

const LF_HEADER = ';ListFile';
const LF_CHARSET = ';charset';
const LF_BASE = ';Base';
const LF_SEARCH = ';Search';
const LF_ERROR = ';Error';
const LF_OPTION = ';Option=directory';

export const bitToDate = (dwHigh: number, dwLow: number): Date => {
  const sec = 1e-7 * (dwHigh * Math.pow(2, 32) + dwLow) - 11644473600;
  const date = new Date(0);
  date.setSeconds(sec);
  return date;
};

export const dateToBit = (...time: number[]): {high: number; low: number} => {
  let sec: number;
  if (time.length === 1) {
    sec = time[0];
  } else {
    const [y, m, ...rest] = time;
    sec = new Date(y, m - 1, ...rest).getTime();
  }

  const dwHigh = (sec * 1e-3 + 11644473600) / 1e-7 / Math.pow(2, 32);
  const dwHigh_ = Math.floor(dwHigh);
  const dwLow = (dwHigh - dwHigh_) * Math.pow(2, 32);
  return {high: dwHigh_, low: dwLow};
};

export const getFiletime = (data: string): string => {
  const arr: number[] = [];
  const elements = data.split(',') ?? [0];

  for (const element of elements) {
    arr.push(Number(element));
  }

  const bit = dateToBit(...arr);

  return `${bit.high}.${bit.low}`;
};

export const formLfData = (data: string, rgx: RegExp, rep: string): string => {
  let comment: string | undefined = undefined;
  data = data.replace(/\\/g, '\\\\');
  data = data.replace(rgx, rep);

  if (~data.indexOf(',"comment":')) {
    data = data.replace(/,"comment":\s?"(.+)"/, (_, m) => {
      comment = `T:"${m.replace(/""/g, '`')}"`;
      return '';
    });
  }

  const o = JSON.parse(data);
  const att = o.att != undefined && o.att !== '' ? o.att : '0';
  const ext = o.ext != undefined ? `X:${o.ext}` : undefined;
  const highlight = o.hl ? `H:${o.hl}` : undefined;
  const mark = o.mark ? `M:${o.mark}` : undefined;
  const exitem = o.oid && o.ovalue ? `O${o.oid}:"${o.ovalue}"` : undefined;
  let [create, access, write]: string[] = [];

  if (!!o.date) {
    create = getFiletime(o.date);
    access = create;
    write = create;
  } else {
    create = o.create ? getFiletime(o.create) : '0.0';
    access = o.access ? getFiletime(o.access) : '0.0';
    write = o.write ? getFiletime(o.write) : '0.0';
  }

  const tbl = [
    `"${o.name ?? ''}"`,
    `"${o.sname ?? ''}"`,
    `A:H${att}`,
    `C:${create}`,
    `L:${access}`,
    `W:${write}`,
    `S:${o.size ?? '0.0'}`,
    `R:${o.reparse ?? '0.0'}`,
    ext,
    highlight,
    mark,
    exitem,
    comment
  ];

  return tbl.removeEmpty().join(',');
};

/**
 * Create line information of ListFile
 * @param lines Lines of raw data
 * @param rgx Pattern of regular expression
 * @param rep Replacement of regular expression
 * @return ListFile lines
 * NOTE: "rep" must be a JSON format string
 * - "ext" specifies the decimal number of the color code
 * - For date information, specify the year, month, day, hour, minute, and second, separated by commas
 * - If "date" is specified, all dates will be set to the same value
 * - "comment" must be specified at the end of the string
 *  example:
 *    neme-only
 *      '{"name":"$1"}'
 *    with date parameter
 *      '{"name":"$1","date":"$2,$3,$4"}'
 *    all parameters
 *      '{"name":"$1","sname":"","att":"$2","create":"$3,$4,$5,$6,$7,$8","write":"$3,$4,$5,$6,$7,$8","access":"$3,$4,$5,$6,$7,$8",
 *      "size":"0.0","reparse":"0.0","ext":16777215,"hl":1,"mark":1,"oid":"id","ovalue":"value","comment":"words"}'
 */
export const createLfItems = ({lines, rgx, rep}: {lines: string[]; rgx: RegExp; rep: string}): typeof items => {
  const items: string[] = [];

  for (const line of lines) {
    items.push(formLfData(line, rgx, rep));
  }

  return items;
};

export const createLfMeta = ({
  charset = 'utf-8',
  basepath,
  dirtype = '0',
  opts
}: {
  charset?: string;
  basepath?: string;
  dirtype?: string;
  opts?: string[];
}): typeof meta => {
  const meta: string[] = [LF_HEADER, `${LF_CHARSET}=${charset}`];

  if (basepath !== '') {
    meta.push(`${LF_BASE}=${basepath}|${dirtype}`);
  }

  if (opts && opts.length > 0) {
    for (const item of opts) {
      meta.push(item);
    }
  }

  return meta;
};

export const getLfMeta = (lines: string[]): typeof metadata => {
  const metadata: Record<string, string> = {};
  const rgx = /^;([^=]+)=(.+)$/;

  for (let i = 0, k = lines.length; i < k; i++) {
    if (lines[i].indexOf(';') !== 0) {
      break;
    }

    lines[i].replace(rgx, (_, id, value) => {
      if (id === 'Base') {
        const v = value.split('|');
        metadata['base'] = v[0];
        metadata['dirtype'] = v[1];
      } else {
        metadata[id.toLowerCase()] = value;
      }

      return '';
    });
  }

  return metadata;
};

type Elements = {
  name: string;
  sname?: string;
  A?: string;
  C?: string;
  L?: string;
  W?: string;
  S?: string;
  R?: string;
  X?: string;
  H?: string;
  M?: string;
  T?: string;
};
type ExElements = Record<string, string>;
export type EntryElements = Elements & Partial<ExElements>;
export const parseLfData = (ele: string[]): EntryElements => {
  if (ele.length === 1) {
    return {name: ele[0].slice(1, -1)};
  }

  const elements: EntryElements = {name: ele[0], sname: ele[1]};
  let i = 2;
  const k = ele.length;
  const rgx = /^([^:]+):["H]?(.+)$/;

  for (; i < k; i++) {
    ele[i].replace(rgx, (_, id, value) => {
      if (id === 'T') {
        value = value.slice(0, -1);
      }

      elements[id] = value;

      return '';
    });
  }

  return elements;
};

export const splitLfData = () => {
  let data: string[] = [];
  const rgx = /^"(.+)",(A:H.+)(,T:".+")?(,Size,.+)?$/;
  const replacer = (_: string, m1: string, m2: string, m3: string) => {
    const m1_ = m1.split('","');
    const m2_ = m2.split(',');
    const m3_ = m3 ? [m3.slice(1)] : [];
    data = [...m1_, ...m2_, ...m3_];
    return '';
  };

  return (line: string): string[] => {
    data = [line];
    const csvIndex = line.indexOf(',Size,');

    if (~csvIndex) {
      line = line.substring(0, csvIndex);
    }

    line.replace(rgx, replacer);

    return data;
  };
};

export const getLfLines = (lines: string[]): EntryElements[] => {
  const items = [];
  const decompLine = splitLfData();

  for (let i = 0, k = lines.length; i < k; i++) {
    if (lines[i].indexOf(';') === 0) {
      continue;
    }

    for (; i < k; i++) {
      const lfData = decompLine(lines[i]);
      items.push(parseLfData(lfData));
    }
  }

  return items;
};
