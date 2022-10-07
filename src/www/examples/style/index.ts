import { defineComponents } from 'src/core/web-component/util'
import AppComp from './App.comp'
import BtnComp from './Btn.comp'

export default (): void => defineComponents(AppComp, BtnComp)
