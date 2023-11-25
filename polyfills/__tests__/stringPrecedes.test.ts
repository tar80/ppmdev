import '../stringPrecedes';

describe('String.prototype.precedes()', function () {
  it('matches', () => {
    const s = 'remove comment transitions ;comment';
    expect(s.precedes(' ;')).toBe('remove comment transitions');
  });
  it('no matches', () => {
    const s = 'remove comment transitions;comment';
    expect(s.precedes(' ;')).toBe('remove comment transitions;comment');
  });
});
