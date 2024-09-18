export const entryAttribute = {
  normal: 0,
  readonly: 1,
  hidden: 2,
  system: 4,
  volume: 8,
  directory: 16,
  archive: 32,
  temporary: 256,
  sparse: 512,
  alias: 1024,
  compressed: 2048,
  offline: 4096,
  noindex: 8192
};

export const newline = {
  TypeToCode: {
    crlf: '\r\n',
    cr: '\r',
    lf: '\n'
  },
  CodeToType: {
    '\r\n': 'crlf',
    '\r': 'cr',
    '\n': 'lf'
  },
  Ppx: {
    lf: '%%bl',
    cr: '%%br',
    crlf: '%%bn',
    unix: '%%bl',
    mac: '%%br',
    dos: '%%bn',
    '\n': '%%bl',
    '\r': '%%br',
    '\r\n': '%%bn'
  },
  Ascii: {
    lf: '10',
    cr: '13',
    crlf: '-1',
    unix: '10',
    mac: '13',
    dos: '-1',
    '\n': '10',
    '\r': '13',
    '\r\n': '-1'
  }
};

export type Histories = keyof typeof refHistory;
export type RefHistories = (typeof refHistory)[Histories];
export const refHistory = {
  g: 'general',
  p: 'PPcRef',
  v: 'PPvRef',
  n: 'number',
  m: 'mask',
  s: 'search',
  h: 'command',
  d: 'directory',
  c: 'filename',
  f: 'fullpath',
  u: 'user1',
  x: 'user2'
} as const;

export const rgxEscape = {
  app: {
    '^': '\\^',
    $: '\\$',
    '(': '\\(',
    ')': '\\)',
    '[': '\\[',
    '|': '\\|',
    '=': '\\=',
    '*': '\\*',
    '+': '\\+',
    '?': '\\?',
    '.': '\\.',
    '/': '\\/',
    '\\': '\\\\'
  },
  exclude: {
    '\\^': '^',
    '\\$': '$',
    '\\(': '(',
    '\\)': ')',
    '\\[': '[',
    '\\]': ']',
    '\\|': '|',
    '\\=': '=',
    '\\*': '*',
    '\\+': '+',
    '\\?': '?',
    '\\.': '.',
    '\\/': '/',
    '\\s': ' ',
    '\\t': '\t',
    '\\\\': '\\'
  }
};

export type Encodes = (typeof fileEnc)[number];
export const fileEnc = [
  'sjis',
  'euc',
  'utf8',
  'utf8bom',
  'unicode',
  'utf16',
  'unicodeb',
  'utf16be',
  'unicodebom',
  'unicodebbom',
  'ibm',
  'us',
  'ansi',
  'latin1',
  'system'
] as const;

export const ppvMediaType = {
  ':DIR': 'dir',
  ':CPL': 'hex',
  ':SCR': 'hex',
  ':EXE': 'hex',
  ':EXE32': 'hex',
  ':EXE32C': 'hex',
  ':EXEDOS': 'hex',
  ':EXEX64': 'hex',
  ':EXEX64C': 'hex',
  ':PIF': 'hex',
  ':DLL': 'hex',
  ':DRV': 'hex',
  ':IME': 'hex',
  ':OCX': 'hex',
  ':SYS': 'hex',
  ':VXD': 'hex',
  ':HHELP': 'hex',
  ':MP4': 'hex',
  ':EBML': 'hex',
  ':WAV': 'hex',
  ':SMF': 'hex',
  ':RIFF': 'hex',
  ':RCM': 'hex',
  ':LHA': 'hex',
  ':CAB': 'hex',
  ':PKZIP': 'hex',
  ':RAR': 'hex',
  ':SZDD': 'hex',
  ':ZOO': 'hex',
  ':ARJ': 'hex',
  ':AR': 'hex',
  ':TAR': 'hex',
  ':ANI': 'image',
  ':AVI': 'image',
  ':BMP': 'image',
  ':EMF': 'image',
  ':GIF': 'image',
  ':ICON': 'image',
  ':PNG': 'image',
  ':TIFF': 'image',
  ':JPEG': 'image',
  ':PS': 'image',
  ':CDX': 'image',
  ':ACAD': 'image',
  ':WEBP': 'image',
  ':WMF': 'image',
  // ':UTEXT': 'doc',
  ':HTML': 'doc',
  ':RTF': 'doc',
  ':PDF': 'doc',
  ':JIS': 'doc',
  ':WRITE': 'doc',
  ':DOCS': 'doc',
  ':OA2': 'doc',
  ':XCHG': 'doc',
  ':HELP': 'doc',
  ':LINK': 'link',
  ':FILELINK': 'link',
  ':TC1': 'ppx',
  ':TC2': 'ppx',
  ':TH1': 'ppx',
  ':TH2': 'ppx',
  ':XVBS': 'cmd',
  ':XJS': 'javascript',
  ':XPLS': 'perl',
  ':XLF': 'json'
} as const;
