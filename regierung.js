const documentElement = document && document.documentElement
const noop = () => {}
const getMedia = (query) => !query ? false : window.matchMedia(query)

const defaults = {
  moduleAttributeName: 'data-module',
  mediaAttributeName: 'data-module-media',
  getModule: (name) => Promise.resolve(self[name]),
  getFactory: (mod) => mod
}

export function run (root = documentElement, options = {}) {
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

  return modules

  function init (element) {
    const name = element.getAttribute(moduleAttributeName)
    const mod = {
      name,
      element,
      load: () => getModule(name).then(getFactory),
      loading: false,
      loaded: false,
      destroy: noop,
      media: getMedia(element.getAttribute(mediaAttributeName))
    }

    return mod.media ? listen(mod) : mount(mod)
  }
}

export function destroy (modules, shouldCleanUp = false) {
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
  const listener = mq => mq.matches ? mount(mod) : unmount(mod)

  media.addListener(listener)
  mod.destroy = () => media.removeListener(listener)
  listener(media)
  return mod
}

function mount (mod) {
  if (mod.loading) return
  mod.loading = true
  mod.loaded = mod.load().then(factory => {
    if (factory == null) {
      throw new Error(`Module with name '${mod.name}' couldn't be found`)
    }
    mod.mount = factory.bind(null, mod.element)
    mod.unmount = mod.mount() || noop
    mod.loading = false
    return true
  })
  return mod
}

function unmount (mod) {
  mod.unmount && mod.unmount()
  mod.loaded = false
  return mod
}
