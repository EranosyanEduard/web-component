import is from 'relax-is/src'
import { TDecorator, TTemplate } from '../models'
import Template from './Template'

type CacheMap<Ctx extends TDecorator.TWebComponent> = WeakMap<Ctx, Map<object, Template<Ctx>>>

/**
 * @description
 * Хранилище шаблонов, созданных из объектов, являющихся элементами списка.
 */
let cache: CacheMap<TDecorator.TWebComponent> | null = null

/**
 * @description
 * Хранилище значений, которые возвращает функция setTimeout при планировании
 * удаления "лишних" элементов списка для определенного веб-компонента.
 */
const timeoutIds: WeakMap<HTMLElement, number> = new WeakMap()

function map<T extends object>(
  context: TDecorator.TWebComponent,
  list: T[],
  cb: (it: T) => TTemplate.ITemplate
): Array<Template<TDecorator.TWebComponent>> {
  cache ??= new WeakMap()

  const items =
    cache.get(context) ??
    (() => {
      const map: NonNullable<ReturnType<typeof cache['get']>> = new Map()
      cache.set(context, map)
      return map
    })()

  if (!timeoutIds.has(context) && is.not.empty.map(items)) {
    const timeoutId = setTimeout(() => {
      Array.from(items.keys()).forEach((key) => {
        const template = items.get(key)!
        if (is.nullable(template.elements[0]?.parentElement)) {
          template.destroy()
          items.delete(key)
        }
      })
      timeoutIds.delete(context)
    })
    timeoutIds.set(context, timeoutId)
  }

  return list.map((it) => {
    const html = cb(it)
    return (
      items.get(it)?.values(html.values) ??
      (() => {
        const template = new Template({ context, ...html })
        items.set(it, template)
        return template
      })()
    )
  })
}

export default map
