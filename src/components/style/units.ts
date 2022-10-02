import { TUnit } from './types'
import { createObj, getCssVar } from './util'

const TYPES: readonly TUnit.Type[] = ['UNIT']

const ALL_TYPES: readonly TUnit.TypeUnion[] = TUnit.TYPE_MODES.flatMap((no) =>
  TYPES.map((type) => `${type}_${no}`)
) as any

const Units = createObj(ALL_TYPES, (it) => {
  const [coef] = it.match(/\d+$/)!
  return `calc(${getCssVar('base-unit-px')} * ${coef})`
})

export default Units
