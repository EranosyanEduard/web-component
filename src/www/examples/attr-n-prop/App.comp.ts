import { Decorator, html, WebComponent } from 'src/core/web-component'

const name = 'app-a'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class App extends HTMLElement implements WebComponent {
  @Decorator.prop<boolean, App>()
  private _btnDisabled = true

  render(): ReturnType<typeof html> {
    return html`
      <button onclick=${this.#toggleBtnState}>Toggle button state</button>
      <btn-a disabled=${this._btnDisabled}>My button</btn-a>
      <span>${this._btnDisabled ? 'Disabled' : 'Enabled'}</span>
    `
  }

  #toggleBtnState(): void {
    this._btnDisabled = !this._btnDisabled
  }
}

export default { cons: App, name }
