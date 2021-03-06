const noop = () => {}
const getMedia = query => (!query ? false : window.matchMedia(query))

const defaults = {
  root: document && document.documentElement,
  moduleAttributeName: 'data-module',
  mediaAttributeName: 'data-module-media',
  getModule: name => Promise.resolve(self[name])
}

export function run (options = {}) {
  const config = { ...defaults, ...options }
  const { root, moduleAttributeName, mediaAttributeName, getModule } = config
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
      load: () => getModule(name),
      loaded: false,
      stopListening: noop,
      media: getMedia(element.getAttribute(mediaAttributeName))
    }

    return mod.media ? listen(mod) : mount(mod)
  }
}

export function destroy (modules, shouldCleanUp = false) {
  if (!Array.isArray(modules)) {
    throw new TypeError(
      "The 'destroy' method expects an array of modules resolved by 'run'"
    )
  }

  modules.forEach(mod => {
    if (shouldCleanUp && mod.stopListening) mod.stopListening()
    unmount(mod)
  })
}

function listen (mod) {
  const { media } = mod

  media.onchange = mq => (mq.matches ? mount(mod) : unmount(mod))
  mod.stopListening = () => {
    media.onchange = null
  }
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
