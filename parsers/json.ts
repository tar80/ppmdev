type ReplaceChars = '"' | '\\';

/** Escape the value for JSON.parse */
export const valueReplacer = (value: string) =>
  value.replace(/["\\]/g, (c) => ({'"': '\\"', '\\': '\\\\'})[c as ReplaceChars]);
