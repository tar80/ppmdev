import '../arrayRemoveEmpty'

describe('arrayRemoveEmpty()', function () {
  it('sorted array', () => {
    expect(([1, undefined, 2, null, 3, '', 4]).removeEmpty()).toStrictEqual([1, 2, 3, 4]);
    expect(([1, [], ' ', {}, 2]).removeEmpty()).toStrictEqual([1, ' ', 2]);
    expect(([[null], {1: '', 2: null}]).removeEmpty()).toStrictEqual([[null], {1: '', 2: null}]);
    expect(([{}, []]).removeEmpty()).toStrictEqual([]);
  });
});
