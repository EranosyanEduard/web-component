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
 * Тип, представляющий фабрику произвольных значений.
 */
type Factory<V = unknown> = () => V

/**
 * @description
 * Тип, представляющий значение или null.
 */
type Nullable<V = unknown> = V | null

/**
 * @description
 * Тип, позволяющий выбрать необязательные поля объекта.
 */
type Option<T extends object, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

/**
 * @description
 * Тип, представляющий функцию-предикат.
 */
type Predicate<V = unknown> = (v: V) => boolean
