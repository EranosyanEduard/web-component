import is from 'relax-is/src'
import { TTemplate as TT } from '../models'
import { bindRegExpG, contentHandlers, eventAttrPrefix, isBindingPattern } from './utils'

class Template<Ctx extends HTMLElement> {
  readonly elements: Element[]

  readonly #bindings: TT.Binding[]

  readonly #context: Ctx

  readonly #root: HTMLDivElement

  readonly #values: unknown[]

  constructor(init: Readonly<Omit<TT.ITemplateInit<Ctx>, 'mode'>>) {
    const { context, template, values } = init

    this.#bindings = []
    this.#context = context
    this.#root = document.createElement('div')
    this.#root.innerHTML = template
    this.elements = Array.from(this.#root.children)

    this.#values = new Proxy(values, {
      get: (target, idx: string): unknown => {
        const i = parseInt(idx)
        const val = target[i]

        if (is.undef(val)) {
          return val
        }
        return is.fun(val) ? val.bind(this.#context) : val
      },
      set: (target, idx: string, v: unknown) => {
        const i = parseInt(idx)
        const val = target[i]

        if (is.not.undef(val) && v !== val) {
          this.#useBinding(this.#bindings[i], v)
          target[i] = v
        }
        return true
      }
    })

    this.#findBindings()
    this.#bindings.forEach((binding, idx) => this.#useBinding(binding, this.#values[idx]))
  }

  destroy(): void {
    this.#bindings.forEach((binding, idx) => {
      const { type } = binding

      switch (type) {
        case 'func':
          if (is.fun(binding.remove)) {
            binding.remove()
          }
          break
        case 'text': {
          const val = this.#values[idx]
          if (is.arr(val)) {
            val.forEach((v) => {
              if (v instanceof Template) {
                v.destroy()
              }
            })
          }
          break
        }
        default:
        // no default;
      }
    })
  }

  values(values: unknown[]): this {
    values.forEach((value, idx) => (this.#values[idx] = value))
    return this
  }

  #findBindings(): void {
    const treeWalker = document.createTreeWalker(
      this.#root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      (node) => {
        switch (node.nodeType) {
          case Node.ELEMENT_NODE:
            return (node as Element).attributes.length > 0
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP
          case Node.TEXT_NODE:
            return is.str(node.nodeValue) && isBindingPattern(node.nodeValue)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          default:
            throw new Error(`Неожиданный тип узла: ${node.nodeType}`)
        }
      }
    )

    const nodeCache: Array<{ fragment: DocumentFragment; node: Node }> = []

    while (is.obj(treeWalker.nextNode())) {
      const node = treeWalker.currentNode

      switch (node.nodeType) {
        case Node.ELEMENT_NODE: {
          const el = node as Element
          const redundantAttrs: string[] = []

          for (let idx = 0; idx < el.attributes.length; idx++) {
            const attr = el.attributes[idx]

            if (isBindingPattern(attr.name)) {
              this.#bindings.push({
                el,
                name: attr.name,
                noName: true,
                type: 'attr'
              })
              redundantAttrs.push(attr.name)
            } else if (isBindingPattern(attr.value)) {
              if (attr.name.startsWith(eventAttrPrefix)) {
                this.#bindings.push({
                  el,
                  name: attr.name.slice(eventAttrPrefix.length),
                  remove: null,
                  type: 'func'
                })
                redundantAttrs.push(attr.name)
              } else {
                this.#bindings.push({
                  el,
                  name: attr.name,
                  noName: false,
                  type: 'attr'
                })
              }
            }
          }

          redundantAttrs.forEach((attr) => el.removeAttribute(attr))
          break
        }
        case Node.TEXT_NODE: {
          const matches = node.nodeValue?.match(bindRegExpG) as RegExpMatchArray

          if (matches.length === 1) {
            this.#bindings.push({ nodes: [node], type: 'text' })
          } else {
            const fragment = document.createDocumentFragment()

            matches.forEach((it) => {
              const textNode = document.createTextNode(it)
              this.#bindings.push({ nodes: [textNode], type: 'text' })
              fragment.append(textNode)
            })

            nodeCache.push({ fragment, node })
          }
          break
        }
        default:
        // no default
      }
    }

    nodeCache.forEach(({ fragment, node }) => node.parentElement?.replaceWith(fragment, node))
  }

  #useBinding(binding: TT.Binding, next: unknown): void | never {
    const { type } = binding

    switch (type) {
      case 'attr': {
        const { el, name, noName } = binding
        let allAttrPairs: object | undefined

        if (!noName) {
          allAttrPairs = { [name]: next }
        } else if (is.obj(next) && is.not.arr(next)) {
          allAttrPairs = next
        }

        Object.entries(allAttrPairs ?? {}).forEach(([key, val]) => {
          if (key === 'class' || key === 'style') {
            el.setAttribute(key, contentHandlers.attr.classOrStyle(key, val))
          } else if (Reflect.has(el, key)) {
            Reflect.set(el, key, val)
          } else {
            el.setAttribute(key, contentHandlers.attr.any(val))
          }
        })
        break
      }
      case 'func': {
        const { el, name, remove } = binding

        if (is.fun(remove)) remove()
        if (is.fun(next)) {
          const castedNext = next as EventListener
          el.addEventListener(name, castedNext)
          binding.remove = () => el.removeEventListener(name, castedNext)
        }
        break
      }
      case 'text': {
        const {
          nodes: [head, ...tail]
        } = binding

        const cachedParent = head.parentElement
        const fragment = document.createDocumentFragment()
        const items: unknown[] = is.arr(next) ? next : [next]
        binding.nodes = []

        if (is.empty.arr(items)) {
          const node = document.createTextNode('')
          binding.nodes[0] = node
          fragment.append(node)
        } else {
          items.forEach((it) => {
            const content = contentHandlers.text(it, this.#context)
            if (is.arr(content)) {
              binding.nodes.push(...content)
              fragment.append(...content)
            } else {
              binding.nodes.push(content)
              fragment.append(content)
            }
          })
        }

        tail.forEach((it) => it.parentElement?.removeChild(it))

        if (is.null(head.parentElement)) {
          cachedParent?.replaceChildren(fragment)
        } else {
          head.parentElement.replaceChild(fragment, head)
        }
        break
      }
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Неожиданный тип привязки: ${type}`)
    }
  }
}

export default Template
