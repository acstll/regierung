const { run, destroy } = require('./dist/regierung.cjs.js')

// This is WIP!

// Module
global.greet = function greet (element) {
  var originalValue = element.textContent
  element.textContent = 'Goodbye'

  return function () {
    element.textContent = originalValue
  }
}

beforeAll(() => {
  document.body.innerHTML = '<div data-module="greet">Hello</div>'
})

test('run basic', async function () {
  const el = document.querySelector('[data-module="greet"]')
  expect(el.textContent).toBe('Hello')
  const modules = run(document.documentElement)
  expect(modules.length).toBe(1)
  const factory = await modules[0].load()
  expect(typeof factory).toBe('function')
  await modules[0].loaded
  expect(el.textContent).toBe('Goodbye')
  destroy(modules)
  expect(el.textContent).toBe('Hello')
  expect(modules[0].loaded).toBe(false)
})
