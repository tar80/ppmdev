export const isString = (value: any): value is string => typeof value === 'string';
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

export const isError = (error: boolean, value: unknown): value is string => {
  const isString = typeof value === 'string';
  return error && isString;
};

export const isInteger = (value: unknown): value is number => {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
