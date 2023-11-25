import '../objectIsEmpty';

describe('Object.isEmpty()', function () {
  it('pass non-object', () => {
    // @ts-ignore
    expect(() => Object.isEmpty('')).toThrow('Object.isEmpty: called on non-object');
    // @ts-ignore
    expect(() => Object.isEmpty(null)).toThrow('Object.isEmpty: called on non-object');
  });
  it('empty object', () => {
    expect(Object.isEmpty({})).toBe(true);
  });
  it('not empty object', () => {
    expect(Object.isEmpty({1: 123})).toBe(false);
    expect(Object.isEmpty({'1': '123'})).toBe(false);
    expect(Object.isEmpty({['1']: [123]})).toBe(false);
  });
});
