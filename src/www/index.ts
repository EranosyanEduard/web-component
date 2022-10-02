import { defineComponents } from 'src/core/web-component'
import { Btn, Input } from 'src/components'
import { ToDo } from 'src/views'
import './index.css'

defineComponents(Btn, Input, ToDo)

const appHost = document.body.firstElementChild as HTMLDivElement
appHost.innerHTML = /* html */ `<rlx-todo></rlx-todo>`
