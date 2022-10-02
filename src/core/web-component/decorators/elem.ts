import is from 'relax-is/src'
import { getMetaData } from './utils'

function elem(params: Readonly<{ selector: string }>): PropertyDecorator {
  const { selector } = params

  return (target, propertyKey) => {
    if (is.sym(propertyKey)) return

    const { elems } = getMetaData(target, 'elems')
    const alreadyUse = elems.get(selector)

    if (is.str(alreadyUse)) {
      throw new Error(`Селектор ${selector} уже используется свойством ${alreadyUse}`)
    }

    elems.set(selector, propertyKey)
  }
}

export default elem
