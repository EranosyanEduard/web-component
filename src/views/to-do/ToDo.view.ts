import is from 'relax-is/src'
import { Decorator, html, map, Style, Template, WebComponent } from 'src/core/web-component'
import { Styles } from 'src/components'

@Decorator.comp({ name: 'rlx-todo', shadow: { mode: 'open' } })
class ToDo extends HTMLElement implements WebComponent {
  @Decorator.prop()
  private _input = ''

  @Decorator.prop()
  private _toDoList: Array<{ complete: boolean; id: number; it: string }> = []

  @Decorator.prop()
  // @ts-expect-error
  private _triggerUpdate = 0

  @Decorator.style()
  // @ts-expect-error
  private readonly _useStyle: Style = () => {
    const gap = Styles.Units.UNIT_5

    return /* css */ `
      :host {
          display: grid;
          grid-template-rows: auto 1fr;
          row-gap: ${gap};
          height: 75vh;
          margin: auto;
          width: 500px;
      }

      ul {
          display: inherit;
          grid-auto-rows: ${Styles.Units.UNIT_10};
          row-gap: inherit;
          list-style: none;
          margin: 0;
          padding-left: 0;
      }

      ${['div', 'ul > li'].map((it) => `:host > ${it}`).join(', ')} {
          display: grid;
          gap: ${gap};
          grid-template-columns: 1fr 20%;
      }

      li > span {
          border: thin solid ${Styles.Colors.GREY.BASE};
          border-radius: ${Styles.Units.UNIT_1};
          display: flex;
          align-items: center;
          padding: ${Styles.Units.UNIT_2};
      }

      li > span.complete {
          background-color: ${Styles.Colors.PRIMARY.LIGHTEN_5};
          border-color: ${Styles.Colors.PRIMARY.BASE};
      }

      li > div {
          display: inherit;
          grid-template-columns: repeat(2, 1fr);
          column-gap: ${Styles.Units.UNIT_2};
      }
    `
  }

  #btnActions = { COMPLETE: 0, DELETE: 1 }

  #nextToDoId = 0

  readonly render: () => Template = () => {
    return html/* html */ `
      <div>
        <rlx-input value=${this._input} width="100%" onsync:value=${this.#onSyncInput}></rlx-input>
        <rlx-btn disabled=${is.empty.str(this._input)} width="100%" onclick=${this.#onAddBtn}>
          Add
        </rlx-btn>
      </div>
      <ul onclick=${this.#onToDoItem}>
        ${map(this, this._toDoList, ({ complete, id, it }) => {
          return html/* html */ `
            <li>
              <span class=${complete ? 'complete' : ''}>${it}</span>
              <div>
                <rlx-btn
                  data-action=${this.#btnActions.COMPLETE}
                  data-item-id=${id}
                  outlined="true"
                  width="100%"
                >
                  v
                </rlx-btn>
                <rlx-btn
                  data-action=${this.#btnActions.DELETE}
                  data-item-id=${id}
                  color=${Styles.Colors.ERROR.BASE}
                  outlined="true"
                  width="100%"
                >
                  x
                </rlx-btn>
              </div>
            </li>
          `
        })}
      </ul>
    `
  }

  #onAddBtn(_evt: MouseEvent): void {
    this._toDoList.push({ complete: false, id: this.#nextToDoId, it: this._input })
    this._input = ''
    this.#nextToDoId++
  }

  #onSyncInput(evt: CustomEvent<string>): void {
    this._input = evt.detail
  }

  #onToDoItem(evt: MouseEvent): void {
    const target = evt.target as HTMLElement

    if (target.tagName.toLowerCase() === 'rlx-btn') {
      const {
        dataset: { action = '', itemId = '' }
      } = target
      const item = this._toDoList.find(({ id }) => id === parseInt(itemId))

      if (is.obj(item)) {
        switch (parseInt(action)) {
          case this.#btnActions.COMPLETE:
            item.complete = !item.complete
            this._triggerUpdate++
            break
          case this.#btnActions.DELETE:
            this._toDoList = this._toDoList.filter((it) => it !== item)
            break
          default:
          // no default
        }
      }
    }
  }
}

export default ToDo
