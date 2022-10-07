import { Decorator, html, Style, Template, WebComponent } from 'src/core/web-component'
import { map, show } from 'src/core/web-component/util'

type Example = 'ATTR_N_PROP' | 'ELEM' | 'EMIT' | 'STYLE'

const name = 'my-app'

@Decorator.comp({ name })
class App extends HTMLElement implements WebComponent {
  @Decorator.prop()
  private _activeExampleId = 0

  #examples: Example[] = ['ATTR_N_PROP', 'ELEM', 'EMIT', 'STYLE']

  #exampleMap = this.#examples.reduce<Map<number, Example>>(
    (acc, item, idx) => acc.set(idx, item),
    new Map()
  )

  #buttons = [...this.#exampleMap]

  @Decorator.style()
  // @ts-expect-error
  private readonly _styles: Style = () => {
    const buttonHeight = '40px'
    const Color = {
      PRIMARY: {
        BASE: '#1a965a',
        LIGHT_5: 'rgb(49 159 98 / 20%)'
      }
    }

    return /* css */ `
      my-app {
        display: flex;
        min-height: 100vh;
      }

      my-app > div {
        margin: auto;
        height: 80vh;
        width: 40%;
      }

      header {
        display: flex;
        justify-content: space-between;
      }

      header > button {
        background-color: white;
        border: thin solid ${Color.PRIMARY.BASE};
        color: ${Color.PRIMARY.BASE};
        cursor: pointer;
        height: ${buttonHeight};
        width: 20%;
        transition: transform 0.2s;
      }

      header > button:hover {
        transform: scale(1.2);
      }

      header > button.active {
        background-color: ${Color.PRIMARY.LIGHT_5};
      }

      main {
        box-sizing: border-box;
        height: calc(100% - ${buttonHeight});
        padding: 20px;
      }
    `
  }

  readonly render: () => Template = () => {
    return html`
      <div>
        <header onclick=${this.#selectExample}>
          ${map(this, this.#buttons, ([id, type]) => {
            return html`<button
              type="button"
              class=${id === this._activeExampleId ? 'active' : ''}
              data-id=${id}
            >
              ${type}
            </button>`
          })}
        </header>
        <main>
          ${show(this, 'EXAMPLES', this._activeExampleId, () => {
            return html`
              <app-a></app-a>
              <app-b></app-b>
              <app-c></app-c>
              <app-d></app-d>
            `
          })}
        </main>
      </div>
    `
  }

  #selectExample(evt: MouseEvent): void {
    const target = evt.target as HTMLElement

    if (target.tagName.toLowerCase() === 'button') {
      const id = parseInt(target.dataset.id ?? '', 10)
      if (this.#exampleMap.has(id)) {
        this._activeExampleId = id
      }
    }
  }
}

export default { cons: App, name }
