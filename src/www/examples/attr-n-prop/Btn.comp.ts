import { Decorator, html, Template, WebComponent } from 'src/core/web-component'

const name = 'btn-a'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class Btn extends HTMLElement implements WebComponent {
  @Decorator.attr({ converter: 'boolean' })
  disabled = false

  render(): Template {
    return html` <button disabled=${this.disabled}><slot></slot></button>`
  }
}

export default { cons: Btn, name }
