import is from 'relax-is/src'
import { TDecorator as TD } from '../models'
import { getMetaData } from './utils'

function prop<V = unknown, Ctx extends HTMLElement = HTMLElement>(
  params: Partial<Readonly<TD.PropParams<V, Ctx>>> = {}
): PropertyDecorator {
  const { compare = null, observe = null } = params

  return (target, propertyKey) => {
    if (is.sym(propertyKey)) return

    const { props } = getMetaData<Ctx, 'props', V>(target, 'props')

    props.set(propertyKey, {
      compare(next, prev) {
        return compare?.call(this, next, prev) ?? next === prev
      },
      observe(next, prev) {
        observe?.call(this, next, prev)
      },
      prop: { key: propertyKey, val: {} }
    })
  }
}

export default prop
