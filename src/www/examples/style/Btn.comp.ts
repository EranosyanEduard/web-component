import { Decorator, html, Style, Template, WebComponent } from 'src/core/web-component'

const name = 'btn-d'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class Btn extends HTMLElement implements WebComponent {
  @Decorator.attr({ converter: 'boolean' })
  disabled = false

  @Decorator.style()
  // @ts-expect-error
  private readonly _staticStyle: Style = () => {
    const sizes = ['height', 'width'].map((prop) => `${prop}: 50px;`).join(' ')
    return `button { color: white; ${sizes} }`
  }

  @Decorator.style({ deps: ['disabled'] })
  // @ts-expect-error
  private readonly _bgStyle: Style = () => {
    return `button { background: ${this.disabled ? 'red' : 'green'}; }`
  }

  render(): Template {
    return html` <button disabled=${this.disabled}><slot></slot></button> `
  }
}

export default { cons: Btn, name }
