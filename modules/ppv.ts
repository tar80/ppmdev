import {isEmptyStr, isZero} from './guard';
import type {Letters} from './types';

export const withinPPv = (): boolean => PPx.Extract('%n').indexOf('V') === 0;

export const ppvExists = (id: Letters | ''): [boolean, string] => {
  const hasID = !isZero(id);

  if (!hasID) {
    id = '';
  } else if (!isEmptyStr(PPx.Extract(`%NV${id}`))) {
    return [true, id];
  }

  return [false, id];
};

export const hideTitlebar = (xwin: string, idName: Letters, isExist: boolean): string => {
  if (isEmptyStr(xwin)) {
    xwin = PPx.Extract('%*getcust(X_win:V)');
  }

  const hasChange = isZero(xwin.indexOf('B0'));

  if (hasChange) {
    isExist ? PPx.Execute(`*execute V${idName},*layout title`) : PPx.Execute(`*setcust X_win:V=B1${xwin.slice(2)}`);
  }

  return hasChange ? xwin : '';
};

export const capturePPv = (idName: Letters, isExist: boolean, hasSync: boolean): void => {
  !isExist && PPx.Execute(`*launch -nostartmsg -hide -wait:idle %0ppvw.exe -bootid:${idName}`);
  PPx.Execute(`*capturewindow V${idName} -pane:~ -selectnoactive%:*wait 0,2`);
  hasSync && PPx.Execute(`*ppvoption sync ${idName}`);
};
