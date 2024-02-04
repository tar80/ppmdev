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
    '$': '\\$',
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
