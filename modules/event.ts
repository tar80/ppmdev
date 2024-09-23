import {isEmptyStr} from './guard.ts';

const TABLE_ID = 'S_ppm#event';

export const onceEvent = (subid: string, cmdline: string): (() => void) => {
  PPx.Execute(`*setcust ${TABLE_ID}:${subid}=%(${cmdline}%)`);

  return (): void => {
    const getCmdline = PPx.Extract(`%*getcust(${TABLE_ID}:${subid})`);

    if (!isEmptyStr(getCmdline)) {
      PPx.Execute(getCmdline);
      PPx.Execute(`*deletecust ${TABLE_ID}:${subid}`);
    }
  };
};

export const userEvent = {
  set(subid: string, cmdline: string): void {
    PPx.Execute(`*setcust ${TABLE_ID}:${subid}=%(${cmdline}%)`);
  },
  unset(subid: string): void {
    const getCmdline = PPx.Extract(`%*getcust(${TABLE_ID}:${subid})`);
    !isEmptyStr(getCmdline) && PPx.Execute(`*deletecust ${TABLE_ID}:${subid}`);
  },
  do(subid: string): void {
    const getCmdline = PPx.Extract(`%*getcust(${TABLE_ID}:${subid})`);
    !isEmptyStr(getCmdline) && PPx.Execute(getCmdline);
  },
  once(subid: string): void {
    const getCmdline = PPx.Extract(`%*getcust(${TABLE_ID}:${subid})`);

    if (!isEmptyStr(getCmdline)) {
      PPx.Execute(getCmdline);
      PPx.Execute(`*deletecust ${TABLE_ID}:${subid}`);
    }
  }
};
