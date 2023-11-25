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
export const getDisplaySize = (parent?: string): number[] => {
  let ppmlib = parent ?? PPx.Extract('%sgu"ppmlib"');

  if (isEmptyStr(ppmlib)) {
    ppmlib = PPx.Extract('%*getcust(S_ppm#global:ppm)\\dist\\lib');
  }

  const seeProcess = `${ppmlib}\\seeProcess.js`;
  const ielow = 'ielowutil.exe';
  const pid = PPx.Extract(`%*script(${seeProcess},${ielow},0)`);
  const ie = PPx.CreateObject('InternetExplorer.Application' as any);
  ie.Navigate('about:blank');
  const s = ie.Document.parentWindow.screen;
  const size = [s.width, s.height];
  ie.Quit();

  if (pid === '0') {
    PPx.Execute(`%Obd taskkill /F /IM ${ielow}`);
  }

  return size;
};
