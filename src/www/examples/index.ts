import { defineComponents } from 'src/core/web-component/util'
import AppView from './App.view'
import defineAttrAndProp from './attr-n-prop'
import defineElem from './elem'
import defineEmit from './emit'
import defineStyle from './style'

function defineAllComponents(): void {
  defineComponents(AppView)
  defineAttrAndProp()
  defineElem()
  defineEmit()
  defineStyle()
}

export default defineAllComponents
