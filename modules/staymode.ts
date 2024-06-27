import debug from '@ppmdev/modules/debug.ts';

/** @deprecated */
export const discardInstance = (debounce: string, debug?: string): void => {
  const instance = PPx.StayMode;
  const propName = `ppm_sm${instance}`;
  const path = "%sgu'ppmlib'\\discardStayMode.js";
  PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${path},${propName},${instance},${debug}`);
};

export const ppx_Discard = (debug?: string, info?: string) => {
  PPx.StayMode = 0;
  info = info ?? '';
  debug === 'DEBUG' && PPx.linemessage(`[DEBUG] discard ${info}`);
};

export const atDebounce = {
  hold: (debounce: string, debug?: string): void => {
    const instance = PPx.StayMode;
    const propName = `ppm_sm${instance}`;
    const path = "%sgu'ppmlib'\\discardStayMode.js";
    PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${path},${propName},${instance},${debug}`);
  },
  ppx_Discard
};

export const atLoadEvent = {
  hold: (label: string, debug: string): void => {
    const ppcid = PPx.Extract('%n');
    const instance = PPx.StayMode;
    const cmd =
      'KC_main:LOADEVENT,' +
      `*if ("${ppcid}"=="%n")%:*script ":${instance},ppx_Discard",${debug},${label}` +
      `%:*linecust ${label}_${ppcid},KC_main:LOADEVENT,`;
    PPx.Extract(`*linecust ${label}_${ppcid},%(${cmd}%)%:%K"@LOADCUST"`);
  },
  ppx_Discard
};
