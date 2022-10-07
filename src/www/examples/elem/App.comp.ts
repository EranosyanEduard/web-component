import { Decorator, html, Template, WebComponent } from 'src/core/web-component'

const name = 'app-b'

@Decorator.comp({
  name,
  shadow: {
    mode: 'open'
  }
})
class App extends HTMLElement implements WebComponent {
  @Decorator.elem({ selector: '#second' })
  private readonly _span!: HTMLSpanElement | null

  #intervalID = NaN

  render(): Template {
    return html`<span id="second">0</span><span>sec</span>`
  }

  connectedCallback(): void {
    if (this._span !== null) {
      const el = this._span
      this.#intervalID = setInterval(() => {
        el.innerText = `${parseInt(el.innerText) + 1}`
      }, 1000)
    }
  }

  disconnectedCallback(): void {
    if (!Number.isNaN(this.#intervalID)) {
      clearInterval(this.#intervalID)
    }
  }
}

export default { cons: App, name }
