export function mutableFilter<T>(
  arr: T[],
  predicate: (value: T, index: number, obj: T[]) => boolean,
) {
  let i = 0
  let j = 0
  while (i < arr.length) {
    if (predicate(arr[i], i, arr)) {
      arr[j] = arr[i]
      j++
    }
    i++
  }
  arr.length = j
  return arr
}
