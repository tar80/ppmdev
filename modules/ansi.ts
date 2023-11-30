import type {AnsiColors} from '@ppmdev/modules/types.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';

export const colors = {
  fg: {
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
    def: '39'
  },
  bg: {
    black: '40',
    red: '41',
    green: '42',
    yellow: '43',
    blue: '44',
    magenta: '45',
    cyan: '46',
    white: '47',
    def: '49'
  }
} as const;

const getEscSeq = (escape: boolean): string => (escape ? '\\x1b[' : '\x1b[');

/**
 * String colored using AnsiColor.
 * @desc AnsiColors "black"|"red"|"green"|"yellow"|"blue"|"magenta"|"cyan"|"white"|"def"
 * @param {boolean} esc - Escape "%"
 */
export const colorlize = ({
  message,
  esc: esc = false,
  fg,
  bg
}: {
  message: string;
  esc?: boolean;
  fg?: AnsiColors;
  bg?: AnsiColors;
}): string => {
  if (isEmptyStr(message)) {
    return '';
  }

  const e = getEscSeq(esc);
  message = message;

  if (!fg || isEmptyStr(fg)) {
    return `${message}`;
  }

  const bgColor = bg ? `${colors.bg[bg]};` : '';
  const ansiCode = `${e}${bgColor}${colors.fg[fg]}m`;

  return `${ansiCode}${message}${e}49;39m`;
};

type Direction = 'u' | 'd' | 'l' | 'r';
export const cursorMove = (direction: Direction = 'u', count: number, esc = false): string => {
  const d = {u: 'A', d: 'B', l: 'C', r: 'D'}[direction];

  if (!d) {
    throw new Error('The direction value is incorrect. Valid value is "u", "d", "l", "r"');
  }

  const e = getEscSeq(esc);

  return `${e}${count}${d}`;
};

export const clear = (esc = false): string => {
  const e = getEscSeq(esc);

  return `${e}2J${e}0;0H`;
};
