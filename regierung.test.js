const { run, destroy } = require('./dist/regierung.cjs.js')

/*
  TODO
  - test `media` and destroy(modules, true)
  - test run() throws when a module cannot be found
*/

// Module
global.greet = function greet (element) {
  var originalValue = element.textContent
  element.textContent = 'Hello'

  return function () {
    element.textContent = originalValue
  }
}

beforeEach(() => {
  document.body.innerHTML = `
    <div data-module="greet">1</div>
    <div class="wrapper">
      <div data-module="greet">2</div>
      <div data-module="greet">3</div>
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
  const modules = run()
  expect(modules.length).toBe(3)
  await modules[0].loaded
  expect(el.textContent).toBe('Hello')
})

test('run() first argument', async function () {
  const root = document.querySelector('.wrapper')
  const el = root.querySelectorAll('[data-module="greet"]')[0]
  expect(el.textContent).toBe('2')
  const modules = run(root)
  expect(modules.length).toBe(2)
})

test('run() `moduleAttributeName` option', async function () {
  const el = document.querySelectorAll('[data-module-different="greet"]')[0]
  const modules = run(document, {
    moduleAttributeName: 'data-module-different'
  })
  expect(modules.length).toBe(1)
  await modules[0].loaded
  expect(el.textContent).toBe('Hello')
})

test('destroy()', async function () {
  const el = document.querySelectorAll('[data-module="greet"]')[0]
  expect(el.textContent).toBe('1')
  const modules = run()
  await modules[0].loaded
  expect(el.textContent).toBe('Hello')
  destroy(modules)
  expect(el.textContent).toBe('1')
  expect(modules[0].loaded).toBe(false)
})
