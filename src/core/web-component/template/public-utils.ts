import is from 'relax-is/src'
import { TDecorator as TD, TTemplate as TT } from '../models'
import Template from './Template'

type TCache<K> = WeakMap<TD.TWebComponent, Map<K, Template<TD.TWebComponent>>>

type StoreMapKey = object
type CacheMap = TCache<StoreMapKey>

type StoreShowOrWhenKey = number | string
type CacheShowOrWhen = TCache<StoreShowOrWhenKey>

type Cache = { map: CacheMap } & Record<'show' | 'when', CacheShowOrWhen>

type Store<K extends keyof Cache> = NonNullable<
  K extends 'map' ? ReturnType<CacheMap['get']> : ReturnType<CacheShowOrWhen['get']>
>

const getStore = (() => {
  // Немедленно создать кеш и "замкнуться" на него.
  const getCache = (() => {
    const cache: Partial<Cache> = {}

    return <K extends keyof Cache>(key: K): Cache[K] =>
      cache[key] ??
      (() => {
        const store = new WeakMap()
        cache[key] = store
        return store
      })()
  })()

  return <K extends keyof Cache, Ctx extends TD.TWebComponent>(
    cacheKey: K,
    context: Ctx,
    onStoreCreated?: (store: Store<K>, context: Ctx) => void
  ): Store<K> => {
    const cache = getCache(cacheKey)

    return (
      cache.get(context) ??
      (() => {
        const store = new Map()
        cache.set(context, store)

        if (is.fun(onStoreCreated)) {
          onStoreCreated(store, context)
        }

        return store
      })()
    )
  }
})()

const getTemplate = <S extends Store<keyof Cache>, Ctx extends TD.TWebComponent>(
  store: S,
  key: Parameters<S['get']>[0],
  templateConsParams: ConstructorParameters<typeof Template<Ctx>>[0],
  onTemplateCreated?: (template: Template<Ctx>) => void
): Template<Ctx> => {
  const unsafeKey = key as never

  // @ts-expect-error
  return (
    store.get(unsafeKey)?.values(templateConsParams.template.values) ??
    (() => {
      const template = new Template(templateConsParams)

      if (is.fun(onTemplateCreated)) {
        onTemplateCreated(template)
      } else {
        store.set(unsafeKey, template)
      }

      return template
    })()
  )
}

/**
 * @description
 * Хранилище значений, которые возвращает функция setTimeout при планировании
 * удаления "лишних" элементов списка для определенного веб-компонента.
 */
const timeoutIds: WeakMap<TD.TWebComponent, number> = new WeakMap()

function map<T extends StoreMapKey>(
  context: TD.TWebComponent,
  list: T[],
  cb: (it: T) => TT.ITemplate
): Array<Template<typeof context>> {
  const store = getStore('map', context)

  if (!timeoutIds.has(context) && is.not.empty.map(store)) {
    timeoutIds.set(
      context,
      setTimeout(() => {
        Array.from(store.keys()).forEach((key) => {
          const template = store.get(key)!
          if (is.nullable(template.elements[0]?.parentElement)) {
            template.destroy()
            store.delete(key)
          }
        })
        timeoutIds.delete(context)
      })
    )
  }

  return list.map((it) => getTemplate(store, it, { context, template: cb(it) }))
}

/**
 * Переопределить метод жизненного цикла **disconnectedCallback**, чтобы "уничтожить"
 * шаблоны, ссылки на которые содержит кеш.
 * @param store - Хранилище шаблонов.
 * @param context - Веб-компонент - собственник шаблона.
 */
const destroyTemplates: Parameters<typeof getStore<'show' | 'when', TD.TWebComponent>>[2] = (
  store,
  context
) => {
  const proto = Object.getPrototypeOf(Object.getPrototypeOf(context))
  const meth = proto.disconnectedCallback

  Object.defineProperty(proto, 'disconnectedCallback', {
    value: () => {
      meth?.call(context)
      setTimeout(() => store.forEach((it) => it.destroy()))
    }
  })
}

function show(
  context: TD.TWebComponent,
  id: StoreShowOrWhenKey,
  index: number,
  factory: () => TT.ITemplate
): Template<typeof context> {
  const store = getStore('show', context, destroyTemplates)
  const template = getTemplate(store, id, { context, template: factory() })

  template.elements.forEach((el, idx) => {
    if (el instanceof HTMLElement) {
      el.style.display = idx === index ? '' : 'none'
    }
  })

  return template
}

function when<K extends StoreShowOrWhenKey>(
  context: TD.TWebComponent,
  caseKey: K,
  cases: Readonly<Record<K, () => { html: TT.ITemplate; noCache?: boolean }>>
): Template<typeof context> {
  const { html, noCache = false } = cases[caseKey]()
  const store = getStore('when', context, destroyTemplates)

  return getTemplate(store, caseKey, { context, template: html }, (template) => {
    if (!noCache) store.set(caseKey, template)
  })
}

export { map, show, when }
