import is from 'relax-is/src'
import { createAttrName, createEvent } from './utils'

function emit(params: Partial<Readonly<{ event: string }>> = {}): MethodDecorator {
  const { event = '' } = params

  return (_target, propertyKey, descriptor) => {
    if (is.sym(propertyKey)) return

    const meth = descriptor.value

    if (is.fun(meth)) {
      // @ts-expect-error
      descriptor.value = function (): void {
        const el = this as unknown as HTMLElement
        const detail = meth.apply(el, arguments)

        el.dispatchEvent(
          createEvent(is.empty.str(event) ? createAttrName(propertyKey) : event, detail)
        )
      }
    }

    return descriptor
  }
}

export default emit
