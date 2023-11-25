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
