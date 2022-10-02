import { Walker } from './utils'

/**
 * @description
 * Тип, представляющий основные категории цветов.
 */
export type Name = 'ERROR' | 'GREY' | 'PRIMARY' | 'SECONDARY'

/**
 * @description
 * Тип, представляющий основные типы цветов.
 */
export type Type = 'BASE' | 'DARKEN' | 'LIGHTEN'

/**
 * @description
 * Тип, представляющий модификаторы основных типов цветов.
 */
export const TYPE_MODES = [1, 2, 3, 4, 5] as const

/**
 * @description
 * Тип, представляющий все допустимые типы цветов.
 */
export type TypeUnion = Extract<Type, 'BASE'> | Walker<Exclude<Type, 'BASE'>, typeof TYPE_MODES>
