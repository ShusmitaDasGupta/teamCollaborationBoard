describe('Basic Tests', () => {
  it('should pass a simple math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass a string test', () => {
    expect('CollabBoard').toContain('Collab');
  });

  it('should pass an array test', () => {
    const arr = ['boards', 'tasks', 'users'];
    expect(arr).toHaveLength(3);
  });

  it('should pass an object test', () => {
    const board = { title: 'My Board', color: '#6366f1' };
    expect(board).toHaveProperty('title');
  });
});