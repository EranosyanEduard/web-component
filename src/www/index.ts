import defineAllComponents from './examples'

defineAllComponents()

const appHost = document.body.firstElementChild!
appHost.innerHTML = '<my-app></my-app>'
