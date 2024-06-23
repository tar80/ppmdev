import debug from '@ppmdev/modules/debug.ts';

// type ValueObj = (string | number | boolean)[];
// type Return<T extends ArgTypes> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : never;
type ArgTypes = string | number | boolean | undefined | null;
type Ret<T extends ArgTypes[], A extends ArgTypes[] = []> =
  T['length'] extends A['length'] ? A : Ret<T, [...A, DetectType<T[A['length']]>]>;
type DetectType<T extends ArgTypes> =
  T extends undefined ? string | undefined :
  T extends string ? T | string :
  T extends number ? T | number :
  T extends boolean ? T | boolean :
  T;

export const hasArg = (spec: string): boolean => {
  if (PPx.Arguments.length === 0) {
    return false;
  }

  return PPx.Argument(0) === spec;
};

export const validArgs = (): string[] => {
  const args: string[] = [];

  if (debug.jestRun()) {
    for (let i = 0, k = process.argv.length; i < k; i++) {
      args.push(PPx.Argument(i));
    }
  } else {
    for (const obj = PPx.Arguments; !obj.atEnd(); obj.moveNext()) {
      args.push(obj.value);
    }
  }

  return args;
};

export const safeArgs = <T extends ArgTypes[]>(...arr: T) => {
  const typedArgs = [];
  const args = validArgs();

  for (let i = 0, k = arr.length; i < k; i++) {
    typedArgs.push(_valueConverter(arr[i], args[i]));
  }

  return typedArgs as Ret<T>;
};

const _valueConverter = (defaultValue: ArgTypes, argValue: string | undefined) => {
  if (argValue == null || argValue === '') {
    return defaultValue != null ? defaultValue : undefined;
  }

  switch (typeof defaultValue) {
    case 'number':
      const n = Number(argValue);

      return isNaN(n) ? defaultValue : n;
    case 'boolean':
      return argValue === 'false' || argValue === '0' || argValue == null ? false : true;
    default:
      return argValue;
  }
};

//export const safeArgs = <T extends ArgObj<U>[], U extends string>(...arr: T) => {
//  const args: string[] = [];
//  const validArgs: Record<string, ArgTypes> = {};
//
//  for (let i = 0, k = PPx.Arguments.length; i < k; i++) {
//    args.push(PPx.Argument(i));
//  }
//
//  for (let i = 0, k = arr.length; i < k; i++) {
//    if (typeof arr[i].key !== 'string') {
//      throw new Error(`Invalid argument: key must be a string`);
//    }
//
//    validArgs[arr[i].key] = _valueConverter(arr[i].value, args[i]);
//  }
//
//  return validArgs as {[K in T[number]['key']]: Return<Extract<T[number], {key: K}>['value']>};
//};

// const _parseArray = (value: string) => {
//   if (!/^\[.*]$/.test(value)) {
//     return;
//   }
//
//   const o = [];
//   const _v = value.slice(1, -1).split(',');
//
//   for (let i = 0, k = _v.length; i < k; i++) {
//     o.push(_typeConverter(_v[i]));
//   }
//
//   return o;
// };

// const _typeConverter = (arr: string) => {
//   let a;
//
//   if (a === 'true') {
//     a = true;
//   } else if (a === 'false') {
//     a = false;
//   } else if (/[0-9\.]+/.test(arr)) {
//     a = Number(arr);
//   } else {
//     a = arr;
//   }
//
//   return a;
// };
