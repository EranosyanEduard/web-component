import is from 'relax-is/src'
import { TTemplate as TT } from '../models'
import { camelToKebab } from '../utils'
import Template from './Template'

// #region "BINDING"

export const eventAttrPrefix = 'on'

export const getBindingPattern = (bindValue: number | string): string => `{{${bindValue}}}`

const bindingPattern = getBindingPattern('\\d+')
const bindRegExp = new RegExp(bindingPattern)

export const isBindingPattern = (pattern: string): boolean => bindRegExp.test(pattern)

export const bindRegExpG = new RegExp(bindingPattern, 'g')

// #endregion "BINDING"

function isHtmlTemplate(content: object): content is TT.ITemplate {
  const [templateKey, valuesKey]: Array<keyof TT.ITemplate> = ['create', 'values']
  return is.str(Reflect.get(content, templateKey)) && is.arr(Reflect.get(content, valuesKey))
}

export const contentHandlers = {
  attr: {
    any(content: unknown): string {
      if (is.bool(content) || is.num(content) || is.str(content)) {
        return content.toString()
      }
      if (is.nullable(content)) {
        return ''
      }
      return 'WARN: USE PRIMITIVE VALUE'
    },
    classOrStyle(attr: 'class' | 'style', content: unknown): string {
      if (is.arr(content)) {
        const separator = attr === 'class' ? ' ' : '; '
        return content.filter((it) => is.str(it) && is.not.empty.str(it)).join(separator)
      }

      if (is.obj(content)) {
        const entries: Array<[string, unknown]> = Object.entries(content)

        switch (attr) {
          case 'class':
            return entries.reduce((acc, [className, canUse]) => {
              if (is.truthy(canUse)) {
                return `${acc} ${className}`
              }
              return acc
            }, '')
          case 'style':
            return entries.reduce((acc, [propKey, propVal]) => {
              if (is.str(propVal)) {
                return `${acc} ${camelToKebab(propKey)}: ${propVal};`
              }
              return acc
            }, '')
          default:
          // no default
        }
      }

      return this.any(content)
    }
  },
  text<Ctx extends HTMLElement>(content: unknown, context: Ctx): Template<Ctx>['elements'] | Node {
    if (is.obj(content)) {
      if (content instanceof Node) {
        return content
      }
      if (content instanceof Template) {
        return content.elements
      }
      if (isHtmlTemplate(content)) {
        return new Template({ context, template: content }).elements
      }
    }
    return document.createTextNode(this.attr.any(content))
  }
}
