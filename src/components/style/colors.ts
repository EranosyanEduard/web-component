import { TColor } from './types'
import { createObj, getCssVar } from './util'

const NAMES: readonly TColor.Name[] = ['ERROR', 'GREY', 'PRIMARY', 'SECONDARY']

const TYPES: readonly TColor.Type[] = ['BASE', 'DARKEN', 'LIGHTEN']

const ALL_TYPES: readonly TColor.TypeUnion[] = [TYPES[0]].concat(
  TColor.TYPE_MODES.flatMap((no) => TYPES.slice(1).map((type) => `${type}_${no}`)) as any
) as any

const getColors = (): Dict<Dict<string, TColor.TypeUnion>, TColor.Name> => {
  const ACC: ReturnType<typeof getColors> = {} as any

  return NAMES.reduce((acc, name) => {
    acc[name] = createObj(ALL_TYPES, (type) =>
      getCssVar(['color', name.toLowerCase(), type.replace('_', '-').toLowerCase()])
    )
    return acc
  }, ACC)
}

const Colors = getColors()

export default Colors
