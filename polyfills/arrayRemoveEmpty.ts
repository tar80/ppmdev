import {isEmptyObj} from '@ppmdev/modules/guard.ts';

declare global {
  interface Array<T> {
    /**
     * Array with empty elements removed
     */
    removeEmpty<T>(this: T[]): T[];
  }
}

if (!Array.prototype.removeEmpty) {
  Array.prototype.removeEmpty = function <T>(this: T[]): typeof cleanedArr {
    const cleanedArr: T[] = [];

    for (let i = 0, k = this.length; i < k; i++) {
      let thisArr = this[i];

      if (
        thisArr == null ||
        thisArr === '' ||
        (thisArr instanceof Array && thisArr.length === 0) ||
        (thisArr instanceof Object && isEmptyObj(thisArr))
      ) {
        continue;
      }

      cleanedArr.push(thisArr);
    }

    return cleanedArr;
  };
}
