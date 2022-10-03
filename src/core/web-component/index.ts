import { Style, WebComponent } from './models/decorators'
import { ITemplate } from './models/template'
import { html, map, when } from './template'
import { defineComponents } from './utils'

const Util = { defineComponents, map, when }

export * as Decorator from './decorators'
export { html, Style, ITemplate as Template, Util, WebComponent }
