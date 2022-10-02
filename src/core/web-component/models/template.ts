interface IBinding<Type extends 'attr' | 'func' | 'text'> {
  type: Type
}

interface IAttrDetail {
  el: Element
  name: string
}

type AttrBinding = IBinding<'attr'> & IAttrDetail & { noName: boolean }
type FuncBinding = IBinding<'func'> & IAttrDetail & { remove: (() => void) | null }
type TextBinding = IBinding<'text'> & { nodes: Node[] }

export type Binding = AttrBinding | FuncBinding | TextBinding

interface IRenderOptions<M extends 'connected' | 'disconnected'> {
  mode: M
}

export interface ITemplate {
  template: string
  values: unknown[]
}

export interface ITemplateInit<Ctx extends HTMLElement> extends IRenderOptions<'connected'>, ITemplate {
  context: Ctx
}

export type RenderOptions<Ctx extends HTMLElement> = ITemplateInit<Ctx> | IRenderOptions<'disconnected'>
