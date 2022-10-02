/**
 * @description
 * Тип, представляющий произвольный конструктор.
 */
type CtorMixin<R = {}> = new (...args: any[]) => R

/**
 * @description
 * Тип, представляющий объектный литерал.
 */
type Dict<V = unknown, K extends string = string> = Record<K, V>

/**
 * @description
 * Тип, позволяющий выбрать необязательные поля объекта.
 */
type Option<T extends object, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

/**
 * @description
 * Тип, представляющий пару значений.
 */
interface IPair<A, B> {
  first: A
  second: B
}

/**
 * @description
 * Тип, представляющий функцию-предикат.
 */
type Predicate<V = unknown> = (v: V) => boolean
