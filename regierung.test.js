const { run, destroy } = require('./dist/regierung.cjs.js')

// Global module
window.greet = function greet (element) {
  var originalValue = element.textContent
  element.textContent = 'Hello'

  return function () {
    element.textContent = originalValue
  }
}

// `matchMedia` is missing in jsdom
window.matchMedia = jest.fn().mockImplementation(function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  }
})

beforeEach(() => {
  document.body.innerHTML = `
    <div data-module="greet">1</div>
    <div class="wrapper">
      <div data-module="greet">2</div>
      <div data-module="greet" data-module-media="(min-width: 40em)">3</div>
    </div>
    <div data-module-different="greet">4</div>
  `
})

afterEach(() => {
  document.body.innerHTML = ''
})

test('run()', async function () {
  const el = document.querySelectorAll('[data-module="greet"]')[0]
  expect(el.textContent).toBe('1')
  const modules = await run()
  expect(modules.length).toBe(3)
  expect(el.textContent).toBe('Hello')
})

test('run() first argument', async function () {
  const root = document.querySelector('.wrapper')
  const el = root.querySelectorAll('[data-module="greet"]')[0]
  expect(el.textContent).toBe('2')
  const modules = await run(root)
  expect(modules.length).toBe(2)
})

test('run() `moduleAttributeName` option', async function () {
  const el = document.querySelectorAll('[data-module-different="greet"]')[0]
  const modules = await run(document, {
    moduleAttributeName: 'data-module-different'
  })
  expect(modules.length).toBe(1)
  expect(el.textContent).toBe('Hello')
})

test('destroy()', async function () {
  const el = document.querySelectorAll('[data-module="greet"]')[0]
  expect(el.textContent).toBe('1')
  const modules = await run()
  expect(el.textContent).toBe('Hello')
  destroy(modules)
  expect(el.textContent).toBe('1')
  expect(modules[0].loaded).toBe(false)
  expect(() => destroy()).toThrow(
    "The 'destroy' method expects an array of modules resolved by 'run'"
  )
})

test('media and destroy(modules, true)', async function () {
  const el = document.querySelector('[data-module-media]')
  const modules = await run()
  expect(el.textContent).toBe('3')
  const mod = modules.find(x => x.media !== false)
  const { media } = mod
  expect(media.matches).toBeFalsy()
  expect(media.media).toBe('(min-width: 40em)')
  expect(typeof media.onchange).toBe('function')
  expect(typeof mod.destroy).toBe('function')
  media.matches = true
  media.onchange(media)
  await mod.loaded
  expect(el.textContent).toBe('Hello')
  const originalDestroy = mod.destroy
  mod.destroy = jest.fn()
  destroy(modules, true)
  expect(mod.destroy).toHaveBeenCalled()
  expect(el.textContent).toBe('3')
  originalDestroy()
  expect(media.onchange).toBeNull()
})

describe('when modules are missing', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-module="greet">1</div>
      <div data-module="grut">2</div>
    `
  })

  test('run() throws', async function () {
    expect.assertions(1)
    const modules = await run()
    await expect(modules[1].loaded).rejects.toThrow(
      "Module with name 'grut' couldn't be found"
    )
  })
})
