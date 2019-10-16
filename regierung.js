const documentElement = document && document.documentElement
const noop = () => {}
const getMedia = (query) => !query ? false : window.matchMedia(query)

const defaults = {
  moduleAttributeName: 'data-module',
  mediaAttributeName: 'data-module-media',
  getModule: (name) => Promise.resolve(self[name]),
  getFactory: (mod) => mod
}

const regierung = { run, destroy }

export default regierung

function run (root = documentElement, options = {}) {
  const config = { ...defaults, ...options }
  const {
    moduleAttributeName,
    mediaAttributeName,
    getModule,
    getFactory
  } = config
  const modules = []
  const elements = root.querySelectorAll('[' + moduleAttributeName + ']')

  for (let i = 0; i < elements.length; i++) {
    modules.push(init(elements[i]))
  }

  return Promise.all(modules)

  function init (element) {
    const name = element.getAttribute(moduleAttributeName)
    const mod = {
      name,
      element,
      load: () => getModule(name).then(getFactory),
      loaded: false,
      destroy: noop,
      media: getMedia(element.getAttribute(mediaAttributeName))
    }

    return mod.media ? listen(mod) : mount(mod)
  }
}

function destroy (modules, shouldCleanUp = false) {
  if (!Array.isArray(modules)) {
    throw new TypeError("The 'destroy' method expects an array of modules returned by 'run'")
  }

  modules.forEach(mod => {
    if (shouldCleanUp && mod.destroy) mod.destroy()
    unmount(mod)
  })
}

function listen (mod) {
  const { media } = mod

  media.onchange = mq => mq.matches ? mount(mod) : unmount(mod)
  mod.destroy = () => { media.onchange = null }
  media.onchange(media)
  return mod
}

function mount (mod) {
  mod.loaded = mod.load().then(factory => {
    if (factory == null) {
      return Promise.reject(
        new Error(`Module with name '${mod.name}' couldn't be found`)
      )
    }
    mod.mount = factory.bind(null, mod.element)
    mod.unmount = mod.mount() || noop
    return true
  })
  return mod
}

function unmount (mod) {
  mod.unmount && mod.unmount()
  mod.loaded = false
  return mod
}
