import { TDecorator as TD, TTemplate as TT } from '../models'
import { getBindingPattern } from './utils'
import Template from './Template'

const cachedComponents: WeakMap<TD.Host<HTMLElement>, Template<HTMLElement>> = new WeakMap()

export function html(strings: TemplateStringsArray, ...values: unknown[]): TT.ITemplate {
  return {
    create() {
      return strings.raw.reduce((acc, str, idx) => `${acc}${getBindingPattern(idx - 1)}${str}`)
    },
    values
  }
}

export function render<T extends HTMLElement>(
  host: TD.Host<T>,
  options: TT.RenderOptions<T>
): void {
  switch (options.mode) {
    case 'connected':
      if (cachedComponents.has(host)) {
        const template = cachedComponents.get(host)
        template?.values(options.template.values)
      } else {
        const { mode: _mode, ...templateOpts } = options
        const template = new Template(templateOpts)

        cachedComponents.set(host, template)
        host.append(...template.elements)
      }
      break
    case 'disconnected':
      cachedComponents.get(host)?.destroy()
      break
    default:
    // no default
  }
}
