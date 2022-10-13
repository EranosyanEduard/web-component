import is from 'relax-is/src'
import { TDecorator as TD } from '../models'
import { camelToKebab } from '../utils'

/**
 * Создать название html-атрибута на основании идентификатора поля веб-компонента.
 * @param propertyKey - Идентификатор поля.
 */
export function createAttrName(propertyKey: string): string {
  return camelToKebab(propertyKey.replaceAll(/(^_+|_+$)/g, ''))
}

/**
 * Создать пользовательское событие.
 * @param event - Название события.
 * @param detail - Полезная нагрузка.
 */
export function createEvent<V>(event: string, detail: CustomEvent<V>['detail']): CustomEvent<V> {
  return new CustomEvent(event, {
    bubbles: true,
    composed: true,
    detail
  })
}

/**
 * Создать строковое представление стилей веб-компонента.
 * @param rules - Стили веб-компонента.
 */
export function createStyle(rules: ReturnType<TD.Style>): string {
  return is.obj(rules)
    ? Object.entries(rules).reduce((styleAcc, [selector, rule]) => {
        const nestedRules: Array<typeof rules> = []

        const ruleBody = Object.entries(rule).reduce((ruleAcc, [propKey, propVal]) => {
          if (is.obj(propVal)) {
            const separator = propKey.startsWith(':') ? '' : ' '
            nestedRules.push({ [`${selector}${separator}${propKey}`]: propVal })
            return ruleAcc
          }

          const val = is.num(propVal) ? `${propVal}px` : propVal
          return `${ruleAcc} ${camelToKebab(propKey)}: ${val};`
        }, '')
        const strRule = `${selector} { ${ruleBody} }`

        const strNestedRules = nestedRules.reduce(
          (ruleAcc, rule) => `${ruleAcc} ${createStyle(rule)}`,
          ''
        )

        return `${styleAcc} ${strRule} ${strNestedRules}`
      }, '')
    : rules
}

/**
 * Извлечь мета-данные, соответствующие определенной категории.
 * @param target - Источник мета-данных.
 * @param key - Категория мета-данных.
 */
export function getMetaData<Ctx extends HTMLElement, K extends keyof TD.MetaData<Ctx, any>, V>(
  target: object,
  key: K
): Pick<TD.MetaData<Ctx, V>, K> {
  if (!Reflect.has(target, TD.allMetaData)) {
    Reflect.set(target, TD.allMetaData, {})
  }

  const metaData: TD.MetaData<Ctx, V> = Reflect.get(target, TD.allMetaData)

  if (is.undef(metaData[key])) {
    metaData[key] = new Map()
  }

  return metaData
}

// #region "DEFAULT CONVERTERS"

const BOOL_CONVERTER: TD.Converter<boolean> = {
  toAttr: (v) => v.toString(),
  toProp: (v) => v === true.toString()
}

const NUM_CONVERTER: TD.Converter<number> = {
  toAttr: (v) => v.toString(),
  toProp: (v) => parseFloat(v)
}

const OBJ_CONVERTER: TD.Converter<object> = {
  toAttr: (v) => JSON.stringify(v),
  toProp: (v) => JSON.parse(v)
}

const STR_CONVERTER: TD.Converter<string> = {
  toAttr: (v) => v,
  toProp: (v) => v
}

export const converters: Record<
  Exclude<TD.Converter<never>, object>,
  Extract<TD.Converter<any>, object>
> = {
  boolean: BOOL_CONVERTER,
  number: NUM_CONVERTER,
  object: OBJ_CONVERTER,
  string: STR_CONVERTER
} as const

// #endregion "DEFAULT CONVERTERS"

export const syncEventPrefix = 'sync'
