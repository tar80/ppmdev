import '@ppmdev/polyfills/arrayIndexOf.ts';
import debug from '@ppmdev/modules/debug.ts';

export const ppx_Discard = (debugMode?: string, info?: string) => {
  PPx.StayMode = 0;
  info = info ?? '';
  debugMode === 'DEBUG' && PPx.linemessage(`[DEBUG] discard ${info}`);
};

type Event = 'ACTIVEEVENT' | 'LOADEVENT';
type Condition = 'instantly' | 'once' | 'hold';
type DiscardOptions = {table: KeysTable; label: string; mapkey?: string; cond?: Condition; debug?: string};
type KeysTable = (typeof _keysTable)[number];

const _keysTable = ['KC_main', 'KV_main', 'KV_img', 'KV_crt', 'KV_page', 'KB_edit', 'K_ppe', 'K_edit', 'K_lied'] as const;
const _validTable = (name: KeysTable): KeysTable => (~_keysTable.indexOf(name) ? name : 'KC_main');
const _linecust = (label: string, table: KeysTable, event: Event | 'CLOSEEVENT'): string => `*linecust ${label},${table}:${event},`;
const _discard = (event: Event) => {
  return ({table, label, mapkey, cond = 'instantly', debug = '0'}: DiscardOptions): void => {
    const instance = PPx.StayMode;
    const ppxid = PPx.Extract('%n');
    const parent = PPx.Extract('%*name(C,"%FDV")');
    const table_ = _validTable(table);
    const atEvent = _linecust(`${label}${ppxid}`, table_, event);
    const clearEvent = _linecust(`${label}${ppxid}`, table_, 'CLOSEEVENT');
    const cond_ = {
      instantly: '',
      once: `*if("${ppxid}"=="%n")%:`,
      hold: `*if("${ppxid}"=="%n")&&("${parent}"!="%*name(C,"%FDV")")%:`
    };
    const cmdline = [atEvent, clearEvent];

    if (mapkey) {
      PPx.Execute(`*mapkey use,${mapkey}`);
      cmdline.push(`*mapkey delete,${mapkey}`);
    }

    cmdline.push(`*js ":${instance},ppx_Discard",${debug},${label}`);
    PPx.Execute(`${atEvent}%(*if %*stayinfo(${instance})%:${cond_[cond]}${cmdline.join('%:')}%)`);
    PPx.Execute(`${clearEvent}%(${cond_.once}${clearEvent}%:${atEvent}%)`);
    /* NOTE: Executing LOADCUST directly resulted in a gray background in PPx198+3, so indirect execution is used. */
    PPx.Execute(`*launch -breakjob -nostartmsg -wait:no %0pptrayw.exe -c %%K"@LOADCUST"`);
  };
};

export const getStaymodeId = (name: string): number | false => {
  name = ~name.indexOf('.') ? name.slice(0, name.indexOf('.')) : name;
  const id = Number(PPx.Extract(`%*getcust(S_ppm#staymode:${name})`));

  return !isNaN(id) && id > 10000 && id;
};

export const atDebounce = {
  hold(instance: number, debugMode?: string): void {
    const SCRIPT_NAME = 'discardStayMode.js';
    PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *script %sgu'ppmlib'\\${SCRIPT_NAME},%n,${instance},${debugMode}`);
  }
};

export const atActiveEvent = {
  /** @deprecated */
  hold: (label: string, debug = '0'): void => {
    const instance = PPx.StayMode;
    const cmd = `*script ":${instance},ppx_Discard",${debug},${label}`;
    _setEvent('KC_main', 'ACTIVEEVENT', `${label}_%N`, cmd, 'instantly');
  },
  discard: _discard('ACTIVEEVENT')
};

export const atLoadEvent = {
  /** @deprecated */
  hold: (label: string, debug = '0'): void => {
    const instance = PPx.StayMode;
    const cmd = `*script ":${instance},ppx_Discard",${debug},${label}`;
    _setEvent('KC_main', 'LOADEVENT', `${label}%n`, cmd, 'hold');
  },
  discard: _discard('LOADEVENT')
};

export const circular = <T>(array: T[]): {get(): T; discard({table, label, mapkey, cond, debug}: DiscardOptions): void} => {
  let idx = 0;

  return {
    get: () => {
      const value = array[idx];
      idx = (idx + 1) % array.length;

      return value;
    },
    discard: _discard('LOADEVENT')
  };
};

/** @deprecated */
export const discardInstance = (debounce: string, debug?: string): void => {
  const SCRIPT_NAME = 'discardStayMode.js';
  const instance = PPx.StayMode;
  const propName = `ppm_staymode${instance}`;
  PPx.Execute(
    `*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script %sgu'ppmlib'\\${SCRIPT_NAME},%n,${instance},${debug}`
  );
};
/** @deprecated */
const _setEvent = (table: KeysTable, event: Event, label: string, cmd: string, cond: Condition): void => {
  const _table = _validTable(table);
  const _linecust = `*linecust ${label},${_table}`;
  const _discard = `${_linecust}:${event},`;
  const _cond = {instantly: '', once: `*if("%n"=="%%n")`, hold: '*if("%n"=="%%n")&&("%FDV"=="%%FDV")'}[cond];
  PPx.Execute(`${_linecust}:${event},${_cond}%%:${_discard}%%:${cmd}`);
  PPx.Execute('%K"@LOADCUST"');
};
