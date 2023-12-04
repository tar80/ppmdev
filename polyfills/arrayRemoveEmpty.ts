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
  Array.prototype.removeEmpty = function <T>(this: T[]): typeof sortedArr {
    const sortedArr: T[] = [];

    for (let i = 0, k = this.length; i < k; i++) {
      let thisArr = this[i];

      if (thisArr == null || thisArr === '') {
        continue;
      }

      if (thisArr instanceof Array && thisArr.length === 0) {
        continue;
      }

      if (thisArr instanceof Object && isEmptyObj(thisArr)) {
        continue;
      }

      sortedArr.push(thisArr);
    }

    return sortedArr;
  };
}
