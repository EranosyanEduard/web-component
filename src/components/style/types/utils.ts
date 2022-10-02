export type Walker<Var extends string, Numbers extends readonly number[]> = {
  [K in keyof Numbers]: `${Var}_${Numbers[K]}`
}[number]
