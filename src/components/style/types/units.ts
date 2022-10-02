import { Walker } from './utils'

/**
 * @description
 * Тип, представляющий основные типы единиц измерения.
 */
export type Type = 'UNIT'

/**
 * @description
 * Тип, представляющий модификаторы основных типов единиц измерения.
 */
export const TYPE_MODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const

/**
 * @description
 * Тип, представляющий все допустимые типы единиц измерения.
 */
export type TypeUnion = Walker<Type, typeof TYPE_MODES>
