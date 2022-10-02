/**
 * Преобразовать аргумент формата camelCase в формат kebab-case.
 * @param arg - Идентификатор.
 */
export function camelToKebab(arg: string): string {
  return arg.replaceAll(/[A-Z]+/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * Инициализировать веб-компоненты, создав их экземпляры.
 * @param Comps - Список веб-компонентов.
 */
export function defineComponents(...Comps: Array<typeof HTMLElement>): void {
  Comps.forEach((Comp) => console.info(`Веб-компонент ${new Comp().constructor.name} определен`))
}
