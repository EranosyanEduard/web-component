import { Decorator, html, Style, Template, WebComponent } from 'src/core/web-component'
import Styles from '../style'

@Decorator.comp({ name: 'rlx-input', shadow: { mode: 'open' } })
class Input extends HTMLElement implements WebComponent {
  @Decorator.attr()
  color = Styles.Colors.PRIMARY.BASE

  @Decorator.attr()
  height = Styles.Units.UNIT_10

  @Decorator.attr()
  rounded = Styles.Units.UNIT_1

  @Decorator.attr()
  type: 'text' = 'text'

  @Decorator.attr({ sync: true })
  value = ''

  @Decorator.attr()
  width = 'auto'

  @Decorator.style({ deps: ['color'] })
  // @ts-expect-error
  private readonly _useStyle: Style = () => {
    return /* css */ `
      div > input {
          color: ${Styles.Colors.GREY.BASE};
      }

      div:focus-within > input {
          color: ${this.color};
      }

      input {
          box-sizing: border-box;
          border: thin solid currentColor;
          border-radius: ${this.rounded};
          padding: ${Styles.Units.UNIT_2};
          outline: none;
      }
    `
  }

  get styles(): string[] {
    return [`height: ${this.height}`, `width: ${this.width}`]
  }

  readonly render: () => Template = () => {
    return html/* html */ `
      <div>
        <input style=${this.styles} type=${this.type} value=${this.value} oninput=${this.#input} />
      </div>
    `
  }

  #input(evt: InputEvent): void {
    evt.stopPropagation()
    this.value = (evt.target as HTMLInputElement).value
  }
}

export default Input
