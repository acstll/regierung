const documentElement = document && document.documentElement
const noop = () => {}

const defaults = {
  select: (root) => [...root.querySelectorAll('[data-module]')],
  getName: (element) => element.getAttribute('data-module'),
  getMediaQuery: (element) => element.getAttribute('data-module-media'),
  getModule: (name) => Promise.resolve(self[name]),
  getFactory: (mod) => mod
}

export function run (root = documentElement, options = {}) {
  const config = {
    ...defaults,
    ...options
  }
  const elements = config.select(root)

  return elements.map(init)

  function init (element) {
    const { getName, getMediaQuery, getModule, getFactory } = config
    const name = getName(element)
    const mod = {
      name,
      element,
      load: () => getModule(name).then(getFactory),
      loading: false,
      destroy: noop,
      media: getMedia(getMediaQuery(element))
    }

    return mod.media ? listen(mod) : mount(mod)
  }
}

export function destroy (modules, shouldCleanUp = false) {
  if (!Array.isArray(modules)) {
    throw new TypeError('The `destroy` method expects an array of modules returned by `run`')
  }

  modules.forEach(mod => {
    if (shouldCleanUp && mod.destroy) mod.destroy()
    mod.unmount && mod.unmount()
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
  mod.load().then(factory => {
    mod.mount = factory.bind(null, mod.element)
    mod.unmount = mod.mount() || noop
    mod.loading = false
  })

  return mod
}

function unmount (mod) {
  mod.unmount && mod.unmount()
  return mod
}

function getMedia (query) {
  return !query ? false : window.matchMedia(query)
}
