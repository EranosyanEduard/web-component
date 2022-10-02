import { ITemplate } from './template'

// * Символы, использующиеся декораторами для хранения собранной информации.
export const allMetaData = Symbol('__ALL_META_DATA__')
export const attrsMetaData = Symbol('__OBSERVED_ATTRIBUTES__')

// #region "COMPONENT DECORATOR"

/**
 * @description
 * Тип, представляющий объект - допустимый корневой элемент.
 */
export type Host<T extends HTMLElement> = T | ShadowRoot

/**
 * @description
 * Интерфейс, представляющий параметр декоратора **component**.
 */
export interface IComponentParams {
  whenDefined: (promise: ReturnType<typeof customElements.whenDefined>) => void
  name: string
  shadow: ShadowRootInit
}

/**
 * @description
 * Тип, представляющий параметр декоратора **component**.
 */
export type ComponentParams = Option<IComponentParams, 'shadow' | 'whenDefined'>

/**
 * @description
 * Тип, представляющий допустимые значения функции-конвертера.
 */
export type Converter<V> =
  | 'boolean'
  | 'number'
  | 'object'
  | 'string'
  | {
      toAttr: (value: V) => string
      toProp: (value: string) => V
    }

interface IObservedValue<Ctx extends HTMLElement, V, VConverter extends Converter<V>> {
  compare: (this: Ctx, next: V, prev: V) => boolean
  observe: (this: Ctx, next: V, prev: V) => void
  validate: Predicate<V>
  converter: VConverter
  prop: {
    key: string
    val: {
      next?: V
      prev?: V
    }
  }
  sync: boolean
}

/**
 * @description
 * Интерфейс, представляющий мета-данные, "собранные" декораторами.
 */
export interface MetaData<Ctx extends HTMLElement, V> {
  attrs: Map<string, Omit<IObservedValue<Ctx, V, Extract<Converter<V>, object>>, 'sync'>>
  elems: Map<string, string>
  props: Map<string, Omit<IObservedValue<Ctx, V, never>, 'converter' | 'sync' | 'validate'>>
  style: Map<string, IStyleParams>
}

/**
 * @description
 * Интерфейс, представляющий жизненный цикл веб-компонента.
 */
export interface IComponentLifeCycle {
  /**
   * @description
   * Метод жизненного цикла "updated".
   * @param name - Название атрибута.
   * @param prev - Предыдущее значение атрибута.
   * @param next - Следующее значение атрибута.
   */
  attributeChangedCallback: (name: string, prev: string | null, next: string | null) => void

  /**
   * @description
   * Метод жизненного цикла "mounted".
   */
  connectedCallback: () => void

  /**
   * @description
   * Метод жизненного цикла "unmounted".
   */
  disconnectedCallback: () => void
}

/**
 * @description
 * Тип, представляющий публичный интерфейс веб-компонента.
 */
export abstract class WebComponent implements Partial<IComponentLifeCycle> {
  abstract render: () => ITemplate
  attributeChangedCallback?: (name: string, prev: string | null, next: string | null) => void
  connectedCallback?: () => void
  disconnectedCallback?: () => void

  static get observedAttributes(): string[] {
    return []
  }
}

export type TWebComponent = HTMLElement & WebComponent
// #endregion "COMPONENT DECORATOR"

// #region "ATTR AND PROP DECORATORS"

/**
 * @description
 * Тип, представляющий параметр декоратора **attr**.
 */
export type AttrParams<V, Ctx extends HTMLElement> = { name: string } & Omit<
  IObservedValue<Ctx, V, Converter<V>>,
  'prop'
>

/**
 * @description
 * Тип, представляющий параметр декоратора **prop**.
 */
export type PropParams<V, Ctx extends HTMLElement> = Pick<IObservedValue<Ctx, V, never>, 'compare' | 'observe'>

// #endregion "ATTR AND PROP DECORATORS"

// #region "STYLE DECORATOR"

/**
 * @description
 * Тип, представляющий параметр декоратора **style**.
 */
export interface IStyleParams {
  deps: string[]
}

/**
 * @description
 * Тип, представляющий объект, содержащий пары ключей и значений для настройки внешнего вида
 * веб-компонента.
 */
export interface ICssRule {
  [key: string]: number | string | ICssRule
}

/**
 * @description
 * Тип, представляющий набор css-правил.
 */
export type Style = () => string | Dict<ICssRule>

/**
 * @description
 * Интерфейс, представляющий хранилище значений, соответствующих определенному ключу.
 */
interface IAction<K, V> {
  on: (k: K, v: V) => void
  use: (k: K) => void
  _deps: Map<K, V[]>
}

/**
 * @description
 * Тип, представляющий интерфейс управления стилями, имеющими зависимости.
 */
export type DependentStyle = IAction<IStyleParams['deps'][0], () => void>

// #endregion "STYLE DECORATOR"
