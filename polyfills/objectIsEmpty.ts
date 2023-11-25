declare global {
  interface ObjectConstructor {
    /**
     * Returns a boolean whether an object is empty.
     * @param {object} obj - Object that contains the properties and methods.
     */
    isEmpty(obj: Record<string, any>): boolean;
  }
}

if (!Object.isEmpty) {
  Object.isEmpty = function (obj: Record<string, any>) {
    if (typeof obj !== 'function' && (typeof obj !== 'object' || obj == null)) {
      throw new TypeError('Object.isEmpty: called on non-object');
    }

    for (var _ in obj) {
      return false;
    }

    return true;
  };
}

export {};
