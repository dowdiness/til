export function sum(a, b) {
  return a + b
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3)
  })
}
