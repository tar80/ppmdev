type ReplaceChars = '"' | '\\';

/** Escape the value for JSON.parse */
export const valueEscape = (value: string) => value.replace(/["\\]/g, (c) => ({'"': '\\"', '\\': '\\\\'})[c as ReplaceChars]);

export const argParse = (): false | string => {
  const arg = PPx.Arguments.length > 0 && PPx.Argument(0).replace(/'/g, '"');

  return arg && parseString(arg);
};

/**
 * Fills in the missing processing in JSON.parse().
 * NOTE: JSON.parse() cannot handle Unicode. It also requires escaping backslashes.
 */
export const parseString = (arg: string) => {
  if (!~arg.indexOf('{') || !~arg.lastIndexOf('}')) {
    return false;
  }

  const elements = arg.slice(1, -1).split(',');
  const rgx = /^("[a-z]+"):\s*(.+)$/;
  const DELIM = '@#delim#@';

  for (let i = 0, k = elements.length, key: string, value: string; i < k; i++) {
    if (elements[i] == null) {
      break;
    }

    [key, value] = elements[i].replace(rgx, `$1${DELIM}$2`).split(DELIM);

    if (value.indexOf('"') === 0) {
      value = `"${valueEscape(value.slice(1, -1))}"`;
    }

    elements[i] = `${key}:${value}`;
  }

  return `{${elements.join(',')}}`;
};
