import debug from '@ppmdev/modules/debug.ts';

export const discardInstance = (debounce: string, debug?: string): void => {
  const instance = PPx.StayMode;
  const propName = `ppm_sm${instance}`;
  const path = "%sgu'ppmlib'\\discardStayMode.js";
  PPx.Execute(`*run -noppb -hide -nostartmsg %0ppbw.exe -c *wait ${debounce}%%:*script ${path},${propName},${instance},${debug}`);
};

export const ppx_Discard = (debug?: string, instance?: string) => {
  PPx.StayMode = 0;
  instance = instance ?? '';
  debug === 'DEBUG' && PPx.linemessage(`[DEBUG] discard ${instance}`);
};
