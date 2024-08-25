import {isEmptyStr, isInteger} from '@ppmdev/modules/guard.ts';

/**
 * Set specified window postion
 * @param target Window handle
 * @param x Horizontal position
 * @param y Vertical position
 */
export const winpos = (target: string, x?: number, y?: number): string => {
  if (isInteger(x) && isInteger(y)) {
    const x_ = x < 0 ? 0 : x;
    const y_ = y < 0 ? 0 : y;

    return `*windowposition ${target},${x_},${y_}`;
  } else {
    return '';
  }
};

/**
 * Set specified window size
 * @param target Window handle
 */
export const winsize = (target: string, width?: number, height?: number): string => {
  if (isInteger(width) && isInteger(height)) {
    const width_ = width < 200 ? 200 : width;
    const height_ = height < 200 ? 200 : height;

    return `*windowsize ${target},${width_},${height_}`;
  } else {
    return '';
  }
};

/** Get Display size */
export const getDisplaySize = (): number[][] => {
  const wmi = PPx.CreateObject('WbemScripting.SWbemLocator' as any).ConnectServer();
  const results = wmi.ExecQuery('SELECT CurrentHorizontalResolution, CurrentVerticalResolution FROM Win32_VideoController');
  const e = PPx.Enumerator(results);
  let display: number[][] = [];

  while (!e.atEnd()) {
    display.push([e.item().CurrentHorizontalResolution, e.item().CurrentVerticalResolution]);
    e.moveNext();
  }

  return display;
};
