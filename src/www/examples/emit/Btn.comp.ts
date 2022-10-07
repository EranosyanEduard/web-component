import { Decorator, html, Template, WebComponent } from 'src/core/web-component'

const name = 'btn-c'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class Btn extends HTMLElement implements WebComponent {
  #totalClick = 0

  render(): Template {
    return html` <button onclick=${this._onClick}><slot></slot></button> `
  }

  @Decorator.emit({ event: 'count' })
  private _onClick(evt: MouseEvent): number {
    evt.stopPropagation()
    return ++this.#totalClick
  }
}

export default { cons: Btn, name }
