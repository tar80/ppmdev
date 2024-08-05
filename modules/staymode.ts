import debug from '@ppmdev/modules/debug.ts';

export const ppx_Discard = (debug?: string, info?: string) => {
  PPx.StayMode = 0;
  info = info ?? '';
  debug === 'DEBUG' && PPx.linemessage(`[DEBUG] discard ${info}`);
};

/** @deprecated */
export const discardInstance = (debounce: string, debug?: string): void => {
  const instance = PPx.StayMode;
  const propName = `ppm_sm${instance}`;
  const path = "%sgu'ppmlib'\\discardStayMode.js";
  PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${path},${propName},${instance},${debug}`);
};

export const atDebounce = {
  hold: (debounce: string, debug?: string): void => {
    const instance = PPx.StayMode;
    const propName = `ppm_sm${instance}`;
    const path = "%sgu'ppmlib'\\discardStayMode.js";
    PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${path},${propName},${instance},${debug}`);
  }
};

export const atActiveEvent = {
  hold: (label: string, debug = '0'): void => {
    const handle = PPx.Extract('%N');
    const instance = PPx.StayMode;
    const cmd =
      'KC_main:ACTIVEEVENT,' +
      `*script ":${instance},ppx_Discard",${debug},${label}` +
      `%%:*linecust ${label}_${handle},KC_main:ACTIVEEVENT,`;
    PPx.Execute(`*linecust ${label}_${handle},${cmd}`);
  }
};

export const atLoadEvent = {
  hold: (label: string, debug = '0'): void => {
    const ppcid = PPx.Extract('%n');
    const instance = PPx.StayMode;
    const cmd =
      'KC_main:LOADEVENT,' +
      `*if ("${ppcid}"=="%n")%:*script ":${instance},ppx_Discard",${debug},${label}` +
      `%:*linecust ${label}_${ppcid},KC_main:LOADEVENT,`;
    PPx.Execute(`*linecust ${label}_${ppcid},%(${cmd}%)`);
    PPx.Execute('%K"@LOADCUST"');
  }
};
