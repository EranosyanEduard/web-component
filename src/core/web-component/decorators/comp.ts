import is from 'relax-is/src'
import { TDecorator, TTemplate } from '../models'
import { isBindingPattern, render } from '../template'
import { createStyle } from './utils'

function comp(
  params: Readonly<TDecorator.ComponentParams>
): <T extends CtorMixin<HTMLElement>>(Target: T) => T {
  const { name: tagName, shadow = null, whenDefined = null } = params

  let taskRenderID: number | null = null

  return (Target) => {
    const attrsMetaData: string[] | undefined = Reflect.get(Target, TDecorator.attrsMetaData)
    Reflect.deleteProperty(Target, TDecorator.attrsMetaData)

    const Component = class C extends Target implements TDecorator.WebComponent {
      readonly render!: () => TTemplate.ITemplate;
      /**
       * @description
       * Мета-данные, собранные декораторами.
       */
      readonly [TDecorator.allMetaData]?: Partial<TDecorator.MetaData<C, unknown>>
      /**
       * @description
       * Корень веб-компонента.
       */
      readonly #root: TDecorator.Host<C>
      /**
       * @description
       * Стили веб-компонента, зависящие от наблюдаемых значений.
       */
      readonly #styles: Readonly<TDecorator.DependentStyle> = {
        _deps: new Map(),
        on(dependency, cb): void {
          if (this._deps.has(dependency)) {
            this._deps.get(dependency)?.push(cb)
          } else {
            this._deps.set(dependency, [cb])
          }
        },
        use(dependency) {
          this._deps.get(dependency)?.forEach((cb) => cb())
        }
      }

      constructor(...args: any[]) {
        super(...args)
        Object.defineProperty(C, 'name', { value: Target.name })

        if (is.not.fun(this.render)) {
          throw new Error(`Реализуйте интерфейс WebComponent в классе ${C.name}`)
        }

        this.#root = is.null(shadow) ? this : this.attachShadow(shadow)
      }

      /**
       * @description
       * Встроенный интерфейс для определения наблюдаемых атрибутов.
       */
      static get observedAttributes(): string[] {
        return [Reflect.get(Target, 'observedAttributes'), attrsMetaData].flatMap((it) =>
          is.arr(it) && is.all.str(it) ? it : []
        )
      }

      attributeChangedCallback(name: string, prev: string | null, next: string | null): void {
        const attrMeta = this[TDecorator.allMetaData]?.attrs?.get(name)

        if (is.undef(attrMeta)) {
          this.#useLifeCycle('attributeChangedCallback', name, prev, next)
        } else if (is.str(prev) && is.str(next) && !isBindingPattern(prev)) {
          const { compare, converter, observe, prop } = attrMeta

          const updateIf = (nextV: unknown, prevV: unknown): void => {
            if (!compare.call(this, nextV, prevV)) {
              observe.call(this, nextV, prevV)
              this.#styles.use(prop.key)
              this.#requestRender()
            }
          }

          is.any.undef([prop.val.next, prop.val.prev])
            ? updateIf(converter.toProp(next), converter.toProp(prev))
            : updateIf(prop.val.next, prop.val.prev)
        }
      }

      connectedCallback(): void {
        this.#assignAttrs()
        this.#assignProps()
        this.#assignStyle()
        this.#render()
        this.#assignElems()
        this.#useLifeCycle('connectedCallback')
      }

      disconnectedCallback(): void {
        render(this.#root, { mode: 'disconnected' })
        this.#useLifeCycle('disconnectedCallback')
      }

      #assignAttrs(): void {
        this[TDecorator.allMetaData]?.attrs?.forEach((params, key) => {
          const { converter, prop, validate } = params
          const defaultAttr = this.getAttribute(key)
          const defaultVal: unknown = Reflect.get(this, prop.key)
          const val: typeof prop.val = {}

          Object.defineProperty(this, prop.key, {
            get: (): unknown =>
              is.undef(val.next) ? converter.toProp(this.getAttribute(key)!) : val.next,
            set: (v: unknown) => {
              if (validate(v)) {
                if (is.fun(v) || is.null(v) || is.obj(v)) {
                  val.prev = val.next
                  val.next = v
                }
                return this.setAttribute(key, converter.toAttr(v))
              }

              console.warn(
                v,
                `не может быть присвоено атрибуту ${key} (свойство ${prop.key}) веб-компонента ${tagName}`
              )
            }
          })

          if (key !== prop.key) {
            Object.defineProperty(this, key, {
              get: (): unknown => Reflect.get(this, prop.key),
              set: (v: unknown) => Reflect.set(this, prop.key, v)
            })
          }
          if (is.null(defaultAttr) || isBindingPattern(defaultAttr)) {
            Reflect.set(this, prop.key, defaultVal)
          }
        })
      }

      #assignElems(): void {
        this[TDecorator.allMetaData]?.elems?.forEach((propertyKey, selector) => {
          try {
            const el = this.#root.querySelector(selector)
            Reflect.set(this, propertyKey, el)
          } catch (error) {
            Reflect.set(this, propertyKey, null)
          }
        })
      }

      #assignProps(): void {
        this[TDecorator.allMetaData]?.props?.forEach((params, key) => {
          const { compare, observe, prop } = params
          const val: typeof prop.val = { next: Reflect.get(this, key) }

          Object.defineProperty(this, key, {
            get: (): unknown => val.next,
            set: (v: unknown) => {
              if (!compare.call(this, v, val.next)) {
                val.prev = val.next
                val.next = v
                observe.call(this, v, val.prev)
                this.#styles.use(key)
                this.#requestRender()
              }
            }
          })
        })
      }

      #assignStyle(): void {
        const style = document.createElement('style')

        this[TDecorator.allMetaData]?.style?.forEach((params, key) => {
          const val: unknown = Reflect.get(this, key)
          if (is.fun(val)) {
            const content: unknown = val()
            if (is.obj(content) || is.str(content)) {
              const text = document.createTextNode(
                createStyle(content as ReturnType<typeof createStyle>)
              )
              params.deps.forEach((propertyKey) => {
                this.#styles.on(propertyKey, () => {
                  text.nodeValue = createStyle(val())
                })
              })
              style.append(text)
            }
          }
        })

        this.#root.append(style)
      }

      #requestRender(): void {
        if (is.null(taskRenderID)) {
          taskRenderID = setTimeout(() => {
            this.#render()
            taskRenderID = null
          })
        }
      }

      #render(): void {
        const { template, values } = this.render()

        if (is.not.empty.str(template)) {
          render(this.#root, {
            context: this,
            mode: 'connected',
            template,
            values
          })
        }
      }

      #useLifeCycle<K extends keyof TDecorator.IComponentLifeCycle>(
        name: K,
        ...args: Parameters<TDecorator.IComponentLifeCycle[K]>
      ): void {
        // @ts-expect-error
        const method = super[name]
        if (is.fun(method)) method.apply(this, args)
      }
    }

    if (is.undef(customElements.get(tagName))) {
      customElements.define(tagName, Component)
      if (is.fun(whenDefined)) {
        whenDefined(customElements.whenDefined(tagName))
      }
    }

    return Component
  }
}

export default comp
