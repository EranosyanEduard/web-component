# web-component, branch "main"

В данном репозитории находится api, позволяющий вам создавать ui-элементы, используя веб-компоненты. Он написан на языке `TypeScript` и расположен в каталоге `/src/core/web-component`. Вы можете познакомиться с примером его использования, перейдя по [ссылке](https://github.com/EranosyanEduard/web-component/tree/example).

## Описание API

### Определение веб-компонента

```ts
import { Decorator, html, WebComponent } from 'core/web-component'

@Decorator.comp({
  name: 'my-component',
  shadow: {
    mode: 'open'
  }
})
class MyComponent extends HTMLElement implements WebComponent {
  render(): ReturnType<typeof html> {
    return html`<div><slot></slot></div>`
  }
}

export default MyComponent
```

Обратите внимание, что обязательным условием определения веб-компонента является наследование от встроенного класса `HTMLElement`, которое предусмотрено спецификацией. Кроме того, необходимо реализовать интерфейс, представленный абстрактным классом `WebComponent`. Единственным полем данного класса, требующим реализации, является поле `render` функционального типа `() => ReturnType<typeof html>`.

### Декораторы

"Пространство имен" `Decorator` содержит декораторы, т.е. функции, дополняющие функциональность веб-компонентов. Далее указан перечень доступных декораторов с примерами их использования, код которых расположен в каталоге `src/www`. Для запуска воспользуйтесь командами: `npm i && npm start`.

- `comp`

  назначение: определение веб-компонента;

  ```ts
  /**
   * @description
   * Параметр декоратора **comp**.
   */
  interface Param {
    whenDefined?: (promise: ReturnType<typeof customElements['whenDefined']>) => void

    /**
     * @description
     * Название веб-компонента. Требования: нижний регистр, kebab case.
     */
    name: string

    /**
     * @description
     * Опции shadow DOM. По умолчанию null.
     */
    shadow?: ShadowRootInit
  }
  ```

- `attr`

  назначение: передача данных от родителя к потомку;

  ```ts
  /**
   * @description
   * Параметр декоратора **attr**.
   */
  interface Param<Value, Context extends HTMLElement> {
    /**
     * @description
     * Функция сравнения следующего и предыдущего значений. В случае, если
     * результатом вызова функции является значение false происходит перерендер
     * веб-компонента, т.е. повторный вызов метода **render**. По умолчанию
     * сравнение значений выполняется с помощью оператора "===".
     */
    compare?: (this: Context, next: Value, prev: Value) => boolean

    /**
     * @description
     * Функция, вызов которой происходит при изменении значения.
     */
    observe?: (this: Context, next: Value, prev: Value) => void

    /**
     * @description
     * Функция валидации следующего значения. В случае, если результатом вызова
     * функции является значение false, значение отклоняется и ничего не
     * происходит. По умолчанию всегда возвращает true.
     */
    validate?: (val: Value) => boolean

    /**
     * @description
     * Функция преобразования значения из свойства в атрибут и обратно. В случае,
     * если значение является функцией, объектом или null оно кешируется и
     * значение атрибута не имеет значения. По умолчанию string.
     */
    converter?:
      | 'boolean'
      | 'number'
      | 'object'
      | 'string'
      | {
          toAttr: (value: Value) => string
          toProp: (value: string) => Value
        }

    /**
     * @description
     * Название атрибута. По умолчанию используется название свойства,
     * преобразованное в kebab case.
     * @example
     * ---------|---------|
     * Свойство | Атрибут |
     * ---------|---------|
     * foo      | foo     |
     * ---------|---------|
     * fooBar   | foo-bar |
     * ---------|---------|
     */
    name?: string

    /**
     * @description
     * Свойство, указывающее на необходимость спровоцировать событие при
     * изменении значения. Название события - "sync:<attribute name>", полезная
     * нагрузка - новое значение.
     */
    sync?: boolean
  }
  ```

  пример:

  ```ts
  // Btn.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-btn',
    shadow: {
      mode: 'open'
    }
  })
  class Btn extends HTMLElement implements WebComponent {
    @Decorator.attr<boolean, Btn>({ converter: 'boolean' })
    disabled = false

    render(): ReturnType<typeof html> {
      return html`
        <button disabled=${this.disabled}>
          <slot></slot>
        </button>
      `
    }
  }

  export default Btn
  ```

  ```ts
  // App.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-app',
    shadow: {
      mode: 'open'
    }
  })
  class App extends HTMLElement implements WebComponent {
    #btnDisabled = true

    render(): ReturnType<typeof html> {
      return html` <my-btn disabled=${this.#btnDisabled}>My button</my-btn> `
    }
  }

  export default App
  ```

  Данный пример демонстрирует определение наблюдаемого атрибута в компоненте `Btn` с помощью декоратора `attr`. В качестве значения по умолчанию используется значение `false`, а конвертера - `'boolean'`, который преобразует значение из логического в строку и обратно.

  Кроме того, для определения наблюдаемых атрибутов (en. "observed attributes") вам также доступен интерфейс, предусмотренный спецификацией:

  ```ts
  // Btn.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-component',
    shadow: {
      mode: 'open'
    }
  })
  class MyComponent extends HTMLElement implements WebComponent {
    static get observedAttributes(): Array<string> {
      return ['my-attr']
    }

    attributeChangedCallback(attr: string, prev: string | null, next: string | null) {
      switch (attr) {
        case 'my-attr':
          // do something
          break
        default:
        // do default
      }
    }

    render(): ReturnType<typeof html> {
      return html`<div><slot></slot></div>`
    }
  }

  export default MyComponent
  ```

- `prop`

  назначение: передача данных от родителя к потомку;

  ```ts
  /**
   * @description
   * Параметр декоратора **prop**.
   */
  interface Param<Value, Context extends HTMLElement> {
    /**
     * @description
     * Функция сравнения следующего и предыдущего значений. В случае, если
     * результатом вызова функции является значение false происходит перерендер
     * веб-компонента, т.е. повторный вызов метода **render**. По умолчанию
     * сравнение значений выполняется с помощью оператора "===".
     */
    compare?: (this: Context, next: Value, prev: Value) => boolean

    /**
     * @description
     * Функция, вызов которой происходит при изменении значения.
     */
    observe?: (this: Context, next: Value, prev: Value) => void
  }
  ```

  пример:

  ```ts
  // Btn.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-btn',
    shadow: {
      mode: 'open'
    }
  })
  class Btn extends HTMLElement implements WebComponent {
    @Decorator.attr<boolean, Btn>({ converter: 'boolean' })
    disabled = false

    render(): ReturnType<typeof html> {
      return html`
        <button disabled=${this.disabled}>
          <slot></slot>
        </button>
      `
    }
  }

  export default Btn
  ```

  ```ts
  // App.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-app',
    shadow: {
      mode: 'open'
    }
  })
  class App extends HTMLElement implements WebComponent {
    @Decorator.prop<boolean, App>()
    private _btnDisabled = true

    render(): ReturnType<typeof html> {
      return html`
        <button onclick=${this.#toggleMyBtnState}>Toggle my-btn state</button>
        <my-btn disabled=${this._btnDisabled}>My button</my-btn>
      `
    }

    #toggleMyBtnState(): void {
      this._btnDisabled = !this._btnDisabled
    }
  }

  export default App
  ```

  **Примечание**: сходство свойств веб-компонента, отмеченных декораторами `attr` и `prop`, заключается в том, что их назначением является передача значения от родителя к потомку, а его изменение "провоцирует" повторный рендер, обеспечивая реактивность. Разница же заключается в том, что 1-ые предусмотрены спецификацией веб-компонентов и "отражаются" непосредственно в атрибуты (см. screenshot):

  ![image-1](./img/example-1.png)

- `emit`

  назначение: передача данных от потомка к родителю;

  ```ts
  /**
   * @description
   * Параметр декоратора **emit**.
   */
  interface Param {
    /**
     * @description
     * Название события. По умолчанию используется название свойства,
     * преобразованное в kebab case.
     */
    event?: string
  }
  ```

  пример:

  ```ts
  // Btn.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-btn',
    shadow: {
      mode: 'open'
    }
  })
  class Btn extends HTMLElement implements WebComponent {
    #totalClick = 0

    render(): ReturnType<typeof html> {
      return html`
        <button onclick=${this._onClick}>
          <slot></slot>
        </button>
      `
    }

    @Decorator.emit({ event: 'count' })
    private _onClick(evt: MouseEvent): number {
      evt.stopPropagation()
      return ++this.#totalClick
    }
  }

  export default Btn
  ```

  ```ts
  // App.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-app',
    shadow: {
      mode: 'open'
    }
  })
  class App extends HTMLElement implements WebComponent {
    @Decorator.prop<number, App>()
    private _totalClick = 0

    render(): ReturnType<typeof html> {
      return html/* html */ `
        <my-btn oncount=${this.#setTotalClick}>My button</my-btn>
        <span>${this._totalClick}</span>
      `
    }

    #setTotalClick(evt: CustomEvent<number>): void {
      this._totalClick = evt.detail
    }
  }

  export default App
  ```

  При вызове декорируемого метода `_onClick` декоратор `emit` создаст и запустит пользовательское событие `count`, используя в качестве полезной нагрузки значение, которое возвращает такой метод, т.е. `число`.

- `style`

  назначение: стилизация веб-компонента;

  ```ts
  /**
   * @description
   * Параметр декоратора **style**.
   */
  interface Param {
    /**
     * @description
     * Массив зависимостей. Под зависимостями имеются ввиду названия наблюдаемых
     * атрибутов и свойств веб-компонента, при изменении значений которых будет
     * происходить "обновление" стилей. При отсутствии зависимостей стили
     * вычисляются однажды. По умолчанию пустой массив.
     */
    deps?: string[]
  }
  ```

  ```ts
  // Btn.comp.ts
  import { Decorator, html, Style, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-btn',
    shadow: {
      mode: 'open'
    }
  })
  class Btn extends HTMLElement implements WebComponent {
    @Decorator.attr<boolean, Btn>({ converter: 'boolean' })
    disabled = false

    @Decorator.style()
    private readonly _staticStyle: Style = () => {
      const sizes = ['height', 'width'].map((prop) => `${prop}: 50px;`).join(' ')
      return `button { color: white; ${sizes} }`
    }

    @Decorator.style({ deps: ['disabled'] })
    private readonly _bgStyle: Style = () => {
      return `button { background: ${this.disabled ? 'red' : 'green'}; }`
    }

    render(): ReturnType<typeof html> {
      return html`
        <button disabled=${this.disabled}>
          <slot></slot>
        </button>
      `
    }
  }

  export default Btn
  ```

  ```ts
  // App.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-app',
    shadow: {
      mode: 'open'
    }
  })
  class App extends HTMLElement implements WebComponent {
    @Decorator.prop<boolean, App>()
    private _btnDisabled = true

    render(): ReturnType<typeof html> {
      return html`
        <button onclick=${this.#toggleMyBtnState}>Toggle my-btn state</button>
        <my-btn disabled=${this._btnDisabled}>My button</my-btn>
      `
    }

    #toggleMyBtnState(): void {
      this._btnDisabled = !this._btnDisabled
    }
  }

  export default App
  ```

  Обратите внимание на то, что для корректной работы декоратора `style` он должен декорировать свойство, значение которого соответствует функциональному типу `Style`. Таких свойств может быть произвольное количество.

- `elem`

  назначение: непосредственный доступ к DOM-элементу;

  ```ts
  /**
   * @description
   * Параметр декоратора **elem**.
   */
  interface Param {
    /**
     * @description
     * Селектор DOM-элемента.
     */
    selector: string
  }
  ```

  ```ts
  // App.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  @Decorator.comp({
    name: 'my-app',
    shadow: {
      mode: 'open'
    }
  })
  class App extends HTMLElement implements WebComponent {
    @Decorator.elem({ selector: '#second' })
    private _span: HTMLSpanElement | null = null

    #intervalID = NaN

    render(): ReturnType<typeof html> {
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

  export default App
  ```

  В случае, если по заданному селектору не удалось найти DOM-элемент, то свойству будет присвоено значение `null`.

### Жизненный цикл

В качестве методов жизненного цикла спецификация веб-компонентов предлагает методы, каждый из которых имеет аналог в популярном web-framework-е:

- `constructor`

- `attributeChangedCallback: (name: string, prev: string | null, next: string | null) => void`

  Данный метод является аналогом методов `updated` / `componentDidUpdate` и используется в связке со свойством `static get observedAttributes(): Array<string>`. В качестве альтернативы я предлагаю вам использовать декоратор `attr` и опцию его параметра `observe`.

- `connectedCallback: () => void`

  Данный метод является аналогом методов `mounted` / `componentDidMount`.

- `disconnectedCallback: () => void`

  Данный метод является аналогом методов `beforeUnmount` / `componentWillUnmount`.

Каждый из этих методов будет использоваться классом, созданным с помощью декоратора `comp`, в соответствующий момент жизни веб-компонента.

### Полезные утилиты

- `defineComponents`

  назначение: определение веб-компонентов;

  ```ts
  interface IComponent {
    cons: typeof HTMLElement
    name: string
  }

  declare function defineComponents(...comps: IComponent[]): void
  ```

  пример:

  ```ts
  // A.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  const name = 'comp-a'

  @Decorator.comp({
    name,
    shadow: {
      mode: 'open'
    }
  })
  class CompA extends HTMLElement implements WebComponent {
    render(): ReturnType<typeof html> {
      return html`<span>comp a</span>`
    }
  }

  export default { cons: CompA, name }
  ```

  ```ts
  // B.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'

  const name = 'comp-b'

  @Decorator.comp({
    name,
    shadow: {
      mode: 'open'
    }
  })
  class CompB extends HTMLElement implements WebComponent {
    render(): ReturnType<typeof html> {
      return html`<span>comp b</span>`
    }
  }

  export default { cons: CompB, name }
  ```

  ```ts
  // index.ts
  import { defineComponents } from 'core/web-component/util'
  import CompA from './A.comp'
  import CompB from './B.comp'

  defineComponents(CompA, CompB)

  const appHost = document.querySelector('#app')

  if (appHost !== null) {
    appHost.innerHTML = `
      <comp-a></comp-a>
      <comp-b></comp-b>
    `
  }
  ```

  Данная утилита позволяет избежать шаблонного кода, поскольку каждый веб-компонент перед использованием должен быть определен.

- `map`

  назначение: рендер списков;

  ```ts
  declare function map<Context extends TWebComponent, Item extends object>(
    context: Context,
    list: Item[],
    cb: (item: Item) => ReturnType<typeof html>
  ): Array<Template<Context>>
  ```

  пример:

  ```ts
  // List.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'
  import { map } from 'core/web-component/util'

  @Decorator.comp({
    name: 'my-list',
    shadow: {
      mode: 'open'
    }
  })
  class List extends HTMLElement implements WebComponent {
    @Decorator.prop<Array<{ id: number; msg: string }>, List>()
    private _messages = ['a', 'b', 'c'].map((char, idx) => ({ id: idx, msg: char }))

    @Decorator.prop<number, List>()
    private _wantRender = Number.MIN_SAFE_INTEGER

    render(): ReturnType<typeof html> {
      return html`
        <button onclick=${this.#popMessages}>remove last message</button>
        <ul>
          ${map(this, this._messages, ({ id, msg }) => {
            return html`<li data-id=${id}>${msg}</li>`
          })}
        </ul>
      `
    }

    #popMessages(_evt: MouseEvent): void {
      if (this._messages.length > 0) {
        // С помощью изменения значения поля _wantRender "провоцируем" перерендер.
        // Это необходимо, поскольку с точки зрения JavaScript не происходит
        // изменение значения _messages.
        this._messages.pop()
        this._wantRender++
      }
    }
  }

  export default List
  ```

  Польза данной утилиты заключается в том, что она кеширует шаблоны, созданные на основе элементов списка, т.е. при следующих рендерах шаблон уже извлекается из кеша. В случае, если элемент "удален" из списка, то соответствующий ему шаблон "уничтожается", удаляя обработчики событий.

  **Примечание**: в качестве ключей HashMap используются объекты - элементы списка. Таким образом, чтобы получить преимущества кеширования необходимо, чтобы ссылки на такие объекты не изменялись.

- `show`

  назначение: условный рендер;

  ```ts
  declare function show<Context extends TWebComponent, K extends number | string>(
    context: Context,
    id: K,
    index: number,
    factory: () => ReturnType<typeof html>
  ): Template<Context>
  ```

  пример:

  ```ts
  // Some.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'
  import { show } from 'core/web-component/util'

  @Decorator.comp({
    name: 'some-comp',
    shadow: {
      mode: 'open'
    }
  })
  class SomeComponent extends HTMLElement implements WebComponent {
    @Decorator.prop<string, SomeComponent>()
    private _spanIndex: 0 | 1 | 2 = 0

    render(): ReturnType<typeof html> {
      return html`
        <div>
          ${show(this, 'SHOW_SPAN', this._spanIndex, () => {
            return html`
              <span>a</span>
              <span>b</span>
              <span>c</span>
            `
          })}
        </div>
        <button onclick=${this.#toggleSpan}>Toggle</button>
      `
    }

    #toggleSpan(_evt: MouseEvent): void {
      switch (this._spanIndex) {
        case 0:
          this._spanIndex = 1
          break
        case 1:
          this._spanIndex = 2
          break
        case 2:
          this._spanIndex = 0
          break
        default:
          throw new Error(`Unexpected span index: ${this._spanIndex}`)
      }
    }
  }

  export default SomeComponent
  ```

  Польза данной утилиты заключается в том, что она обеспечивает условный рендер элементов, созданных на основе результата вызова функции-фабрики (последний аргумент функции `show`). Данные элементы немедленно добавляются в разметку, а также кешируются. Функция `show` принимает решение о том, какой элемент необходимо отобразить, сравнивая аргумент `index` с индексом элемента.

  **Примечание**: в случае, если в рамках одного веб-компонента, вы несколько раз используете утилиту `show`, то необходимо сделать так, чтобы аргумент `id` (2-ой по порядку аргумент функции) был уникальным.

- `when`

  назначение: условный рендер;

  ```ts
  declare function when<Context extends TWebComponent, K extends string>(
    context: Context,
    action: K,
    actions: Record<K, { html: ReturnType<typeof html>; noCache?: boolean }>
  ): Template<Context>
  ```

  пример:

  ```ts
  // Some.comp.ts
  import { Decorator, html, WebComponent } from 'core/web-component'
  import { when } from 'core/web-component/util'

  @Decorator.comp({
    name: 'some-comp',
    shadow: {
      mode: 'open'
    }
  })
  class SomeComponent extends HTMLElement implements WebComponent {
    @Decorator.prop<string, SomeComponent>()
    private _case: 'A' | 'B' | 'C' = 'A'

    render(): ReturnType<typeof html> {
      return html`
        <div>
          ${when(this, this._case, {
            A: () => ({ html: html`<span>a</span>`, noCache: false }),
            B: () => ({ html: html`<span>b</span>`, noCache: false }),
            C: () => ({ html: html`<span>c</span>`, noCache: false })
          })}
        </div>
        <button onclick=${this.#toggleCase}>Toggle</button>
      `
    }

    #toggleCase(_evt: MouseEvent): void {
      switch (this._case) {
        case 'A':
          this._case = 'B'
          break
        case 'B':
          this._case = 'C'
          break
        case 'C':
          this._case = 'A'
          break
        default:
          throw new Error(`Unexpected case type: ${this._case}`)
      }
    }
  }

  export default SomeComponent
  ```

  Польза данной утилиты заключается в том, что она обеспечивает условный рендер, предоставляя возможность кеширования шаблона. Вы можете управлять возможностью кеширования шаблона с помощью поля `noCache` соответствующего объекта, по умолчанию данная возможность используется.

  **Примечание А**: в случае, если в рамках одного веб-компонента, вы несколько раз используете утилиту `when`, то необходимо сделать так, чтобы ключи каждого из объектов (3-ий по порядку аргумент функции) были уникальными.

  **Примечание Б**: в случае, если в рамках условного рендера вы возвращаете разметку, содержащую веб-компонент, то необходимо помнить о том, что при изменении условия рендера, в результате которого веб-компонент будет удален из DOM, он также будет размонтирован, т.е. произойдет вызов метода жизненного цикла disconnectedCallback. В результате вызова данного метода все обработчики событий, присутствующие в шаблоне этого веб-компонента будут удалены. В подобных случаях "выключайте" кеширование, установив полю `noCache` значение `true`.
