import is from 'relax-is/src'

export const createObj = <K extends string, V>(
  keys: readonly K[],
  getValue: (it: K) => V
): Dict<V, K> => {
  const ACC: Dict<V, K> = {} as any

  return keys.reduce((acc, it) => {
    acc[it] = getValue(it)
    return acc
  }, ACC)
}

export const getCssVar = (key: string | string[], fallbackVal = ''): string => {
  return `var(--${is.arr(key) ? key.join('-') : key}, ${fallbackVal})`
}
