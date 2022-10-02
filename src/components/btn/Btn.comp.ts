import { Decorator, html, Style, Template, WebComponent } from 'src/core/web-component'
import Styles from '../style'

@Decorator.comp({ name: 'rlx-btn', shadow: { mode: 'open' } })
class Btn extends HTMLElement implements WebComponent {
  @Decorator.attr()
  color = Styles.Colors.PRIMARY.BASE

  @Decorator.attr({ converter: 'boolean' })
  disabled = false

  @Decorator.attr()
  height = Styles.Units.UNIT_10

  @Decorator.attr({ converter: 'boolean' })
  outlined = false

  @Decorator.attr()
  rounded = Styles.Units.UNIT_1

  @Decorator.attr()
  type: 'button' | 'reset' | 'submit' = 'button'

  @Decorator.attr()
  width = 'auto'

  @Decorator.style({ deps: ['color', 'disabled'] })
  // @ts-expect-error
  private readonly _useStyle: Style = () => {
    const colors: IPair<string, string> = {
      first: this.disabled ? Styles.Colors.GREY.BASE : this.color,
      second: 'white'
    }

    return /* css */ `
      button {
          background-color: ${colors.first};
          border: none;
          border-radius: ${this.rounded};
          color: ${colors.second};
          cursor: pointer;
          text-transform: uppercase;
          transition: opacity 0.2s;
      }

      button:hover {
          opacity: 0.8;
      }

      button:disabled {
          cursor: default;
          opacity: 1;
      }

      :host([outlined=true]) button {
          background-color: ${colors.second};
          border: thin solid;
          ${((clr) => `
              border-color: ${clr};
              color: ${clr};
          `)(colors.first)}
      }
    `
  }

  get styles(): string[] {
    return [`height: ${this.height}`, `width: ${this.width}`]
  }

  readonly render: () => Template = () => {
    return html/* html */ `
      <button style=${this.styles} type=${this.type} disabled=${this.disabled}>
        <slot></slot>
      </button>
    `
  }
}

export default Btn
