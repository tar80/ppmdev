import type {ZeroTo} from '@ppmdev/modules/types.ts';

export const isEmptyStr = (value: string): boolean => value === '';
export const isEmptyObj = (obj: Record<string, any>): boolean => {
  if (obj === undefined) {
    return false;
  }

  if (obj === null) {
    return true;
  }

  for (const _ in obj) {
    return false;
  }

  return true;
};

export const isError = (error: boolean, value: unknown): value is string => error && typeof value === 'string';

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value;
};

export const isBottom = (value: unknown): value is undefined | null  => value == null;

export const isZero = (value: string | number): boolean => {
  if (value === null) {
    return false;
  }

  if (value === '0') {
    return true;
  }

  return value === 0;
};

export const withinRange = <T extends number>(n: number, max: T): n is ZeroTo<T> => 0 <= n && n <= Number(max);

/** @deprecated */
export const isNonZero = (value: string | number): boolean => {
  if (typeof value === 'string') {
    return !isEmptyStr(value) && value !== '0';
  }

  return value !== 0;
};
