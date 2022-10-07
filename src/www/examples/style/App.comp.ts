import { Decorator, html, Template, WebComponent } from 'src/core/web-component'

const name = 'app-d'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class App extends HTMLElement implements WebComponent {
  @Decorator.prop()
  private _btnDisabled = true

  render(): Template {
    return html`
      <button onclick=${this.#toggleBtnState}>Toggle btn state</button>
      <btn-d disabled=${this._btnDisabled}>Button comp</btn-d>
      <span>${this._btnDisabled ? 'Disabled' : 'Enabled'}</span>
    `
  }

  #toggleBtnState(): void {
    this._btnDisabled = !this._btnDisabled
  }
}

export default { cons: App, name }
