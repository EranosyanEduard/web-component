import { TDecorator, TTemplate } from '../models'
import Template from './Template'

type CacheWhen<Ctx extends TDecorator.TWebComponent> = WeakMap<Ctx, Map<string, Template<Ctx>>>

/**
 * @description
 * Хранилище шаблонов, созданных при помощи функций - фабрик, являющихся
 * элементами объекта.**actions**.
 */
let cache: CacheWhen<TDecorator.TWebComponent> | null = null

function when<K extends string>(
  context: TDecorator.TWebComponent,
  action: K,
  actions: Readonly<Dict<() => TTemplate.ITemplate, K>>
): Template<TDecorator.TWebComponent> {
  cache ??= new WeakMap()

  const items =
    cache.get(context) ??
    (() => {
      const proto = Object.getPrototypeOf(Object.getPrototypeOf(context))
      const disconnectedCb = proto.disconnectedCallback
      const map: NonNullable<ReturnType<typeof cache['get']>> = new Map()

      Object.defineProperty(proto, 'disconnectedCallback', {
        value: () => {
          disconnectedCb?.call(context)
          setTimeout(() => map.forEach((it) => it.destroy()))
        }
      })

      cache.set(context, map)
      return map
    })()

  const html = actions[action]()

  return (
    items.get(action)?.values(html.values) ??
    (() => {
      const template = new Template({ context, ...html })
      items.set(action, template)
      return template
    })()
  )
}

export default when
