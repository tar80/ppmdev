import debug from '@ppmdev/modules/debug.ts';

const SCRIPT_PATH = "%sgu'ppmlib'\\discardStayMode.js";

export const ppx_Discard = (debug?: string, info?: string) => {
  PPx.StayMode = 0;
  info = info ?? '';
  debug === 'DEBUG' && PPx.linemessage(`[DEBUG] discard ${info}`);
};

/** @deprecated */
export const discardInstance = (debounce: string, debug?: string): void => {
  const instance = PPx.StayMode;
  const propName = `ppm_sm${instance}`;
  PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${SCRIPT_PATH},${propName},${instance},${debug}`);
};

export const atDebounce = {
  hold: (debounce: string, debug?: string): void => {
    const instance = PPx.StayMode;
    const propName = `ppm_sm${instance}`;
    PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${SCRIPT_PATH},${propName},${instance},${debug}`);
  }
};

type Event = 'ACTIVEEVENT' | 'LOADEVENT';
const _oneshot = (event: Event, label: string, cmd: string): void => {
  const linecust = `*linecust ${label},KC_main:${event},`;
  PPx.Execute(`${linecust}${linecust}%%:${cmd}`);
  PPx.Execute('%K"@LOADCUST"');
};

export const atActiveEvent = {
  hold: (label: string, debug = '0'): void => {
    const handle = PPx.Extract('%N');
    const instance = PPx.StayMode;
    const cmd = `*script ":${instance},ppx_Discard",${debug},${label}`;
    _oneshot('ACTIVEEVENT', `${label}_${handle}`, cmd);
  }
};

export const atLoadEvent = {
  hold: (label: string, debug = '0'): void => {
    const ppcid = PPx.Extract('%n');
    const instance = PPx.StayMode;
    const cmd = `*if ("${ppcid}"=="%n")%:*script ":${instance},ppx_Discard",${debug},${label}`;
    _oneshot('LOADEVENT', `${label}_${ppcid}`, `%(${cmd}%)`);
  }
};
