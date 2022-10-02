import is from 'relax-is/src'
import { TDecorator } from '../models'
import { converters, createAttrName, createEvent, getMetaData, syncEventPrefix } from './utils'

function attr<V = unknown, Ctx extends HTMLElement = HTMLElement>(
  params: Partial<Readonly<TDecorator.AttrParams<V, Ctx>>> = {}
): PropertyDecorator {
  const {
    compare = null,
    converter = 'string',
    name = '',
    observe = null,
    sync = false,
    validate = () => true
  } = params

  return (target, propertyKey) => {
    if (is.sym(propertyKey)) return

    const { attrs } = getMetaData<Ctx, 'attrs', V>(target, 'attrs')
    const attrName = is.empty.str(name) ? createAttrName(propertyKey) : name
    const attr = attrs.get(name)

    if (is.obj(attr)) {
      throw new Error(`Атрибут ${attrName} уже используется свойством ${attr.prop.key}`)
    }

    if (!Reflect.has(target.constructor, TDecorator.attrsMetaData)) {
      Object.defineProperty(target.constructor, TDecorator.attrsMetaData, {
        get: (): string[] => [...attrs.keys()]
      })
    }

    attrs.set(attrName, {
      compare(next, prev) {
        return compare?.call(this, next, prev) ?? next === prev
      },
      converter: is.obj(converter) ? converter : converters[converter],
      observe(next, prev) {
        observe?.call(this, next, prev)
        if (sync) {
          this.dispatchEvent(createEvent(`${syncEventPrefix}:${attrName}`, next))
        }
      },
      prop: { key: propertyKey, val: {} },
      validate
    })
  }
}

export default attr
