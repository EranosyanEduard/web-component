import { Decorator, html, Template, WebComponent } from 'src/core/web-component'

const name = 'app-c'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class App extends HTMLElement implements WebComponent {
  @Decorator.prop()
  private _totalClick = 0

  render(): Template {
    return html/* html */ `
      <btn-c oncount=${this.#setTotalClick}>My button component</btn-c>
      <span>${`Total click: ${this._totalClick}`}</span>
    `
  }

  #setTotalClick(evt: CustomEvent<number>): void {
    this._totalClick = evt.detail
  }
}

export default { cons: App, name }
