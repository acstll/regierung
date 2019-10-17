# Regierung

![npm](https://img.shields.io/npm/v/regierung)

> ~~Organize~~ Govern your website's JavaScript

This package is a bare-bones implementation of the awesome [Conditioner](https://github.com/rikschennink/conditioner) library. It solves the same problem but with less features and less complexity.

**If you're building a plain-old website, this is for you.** If you're building a client-side app and using a framework, you can happily move on.

It's less than 1 Kb minified and gzipped.

## Install

With [npm](https://github.com/npm/cli) do:

```bash
npm i regierung
```

If you're using [Yarn](https://yarnpkg.com/lang/en/), you know what to do.

## Usage

Regierung is glue for 3 things: your HTML, your JavaScript code and your bundler.

JavaScript should be organized in modules. Modules are functions that take a DOM element, and can optionally return another function for cleaning up.

You have a module:

```js
function ToUppercase (element) {
  let oldValue = element.textContent

  element.textContent = oldValue.toUpperCase()

  return () => {
    element.textContent = oldValue
  }
}
```

In your HTML:

```html
<p data-module="ToUppercase">
  Alles wird besser, aber nichts wird gut.
</p>
```

Then when your website loads, you can do:

```js
import { run } from 'regierung'

run()
```

And you get:

`ALLES WIRD BESSER, ABER NICHTS WIRD GUT.`

Without any configuration, Regierung expects all modules to be globally available, that is attached to `window`. But you're probably doing better…

### Code splitting

Regierung truly shines when used together with a modern module bundler like [Webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/) or [Rollup](https://rollupjs.org/guide/en/).

This way you can have your modules organized in files, and they will be loaded only when needed.

You need to tell Regierung how to find your modules, using [dynamic `import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import):

```js
import { run } from 'regierung'

run({
  getModule: name => import(`./modules/${name}.js`).then(x => x.default)
})
```

The module from earlier:

```js
// ./modules/upper.js
export default function (element) {
  let oldValue = element.textContent

  element.textContent = oldValue.toUpperCase()

  return () => {
    element.textContent = oldValue
  }
}
```

The HTML:

```html
<p data-module="upper">
  Alles wird besser, aber nichts wird gut.
</p>
```

Notice you give it the name of the file in the `data-module` attribute (`upper`), and you specify the path to it in the `getModule` callback (`./modules/${name}.js`).

### Media queries

You can have your modules run based on a media query, via the `data-module-media` attribute:

```html
<p data-module="upper" data-module-media="(min-width: 60em)">
  Alles wird besser, aber nichts wird gut.
</p>
```

This uses the [`matchMedia` API](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), so it will react to the browser window resizing.

## Contributing

PRs accepted.

## License

Apache 2.0