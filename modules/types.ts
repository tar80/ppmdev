export type NlCodes = '\r\n' | '\r' | '\n';
export type NlTypes = 'crlf' | 'cr' | 'lf';
export type AnsiColors = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'def';
export type FileEncode = 'sjis' | 'utf16le' | 'utf8';
export type ErrorLevel = number;
export type Error_String = [boolean, string];
export type Error_Data = [true, string] | [false, string[]];
export type Level_String = [ErrorLevel, string];
export type Letters = LowerLetters | UpperLetters;
export type LowerLetters =  'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z';
export type UpperLetters = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z';
export type ScriptEngine = 'JScript' | 'ClearScriptV8' | 'QuickJS';
export type HighlightNumber = ZeroTo<7>
export type Mutable<T> = {-readonly [P in keyof T]: T[P]};
export type Flatten<T> = T extends (infer Item)[] ? Item : T;
export type ZeroTo<T extends number, A extends number[] = []> = A['length'] extends T ? A[number] | T : ZeroTo<T, [...A, A['length']]>;
