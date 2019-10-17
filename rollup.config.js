import buble from 'rollup-plugin-buble'
import prettier from 'rollup-plugin-prettier'
import pkg from './package.json'

const prettierOptions = {
  parser: 'babel',
  semi: false,
  singleQuote: true
}

export default [
  {
    input: './regierung.js',
    output: [
      {
        name: 'Regierung',
        file: pkg.browser,
        format: 'umd'
      },
      {
        file: pkg.main,
        format: 'cjs'
      }
    ],
    plugins: [
      buble({
        transforms: { modules: false },
        objectAssign: 'Object.assign'
      }),
      prettier(prettierOptions)
    ]
  },
  {
    input: './regierung.js',
    output: {
      file: pkg.module,
      format: 'es'
    },
    plugins: [prettier(prettierOptions)]
  }
]
