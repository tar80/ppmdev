declare global {
  interface String {
    /**
     * Returns the string that precedes the substring
     * @param {string} searchString - The substring to search for in the string
     */
    precedes(this: string, searchString: string): string;
  }
}

if (!String.prototype.precedes) {
  String.prototype.precedes = function (str: string): string {
    var len = this.indexOf(str);

    if (!~len) {
      return this;
    }

    return this.slice(0, len);
  };
}

export {};
