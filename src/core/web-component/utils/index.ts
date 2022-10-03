import is from 'relax-is/src'

/**
 * Преобразовать аргумент формата camelCase в формат kebab-case.
 * @param arg - Идентификатор.
 */
export function camelToKebab(arg: string): string {
  return arg.replaceAll(/[A-Z]+/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * Инициализировать веб-компоненты, создав их экземпляры.
 * @param comps - Список веб-компонентов.
 */
export function defineComponents(
  ...comps: Array<{ cons: typeof HTMLElement; name: string }>
): void {
  comps.forEach((comp) => {
    if (is.undef(customElements.get(comp.name))) {
      customElements.define(comp.name, comp.cons)
      console.info(`Веб-компонент ${comp.name} определен`)
    }
  })
}
