import is from 'relax-is/src'
import { TDecorator as TD } from '../models'
import { getMetaData } from './utils'

function style(params: Partial<Readonly<TD.IStyleParams>> = {}): PropertyDecorator {
  const { deps = [] } = params

  return (target, propertyKey) => {
    if (is.sym(propertyKey)) return

    const { style } = getMetaData(target, 'style')

    style.set(propertyKey, { deps })
  }
}

export default style
