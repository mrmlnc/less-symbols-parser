# less-symbols-parser

> A very simple and fast Less Symbols parser.

## Donate

If you want to thank me, or promote your Issue.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mrmlnc)

> Sorry, but I have work and support for plugins and modules requires some time after work. I will be glad of your support or PR's.

## Install

```shell
$ npm i -S less-symbols-parser
```

## Why?

Primarily, this module is designed to work with [vscode-less](https://github.com/mrmlnc/vscode-less) extension.

  * Dependencies free.
  * Returns document Variables, Mixins and Imports.
  * Very fast.

## Usage

```js
const symbolsParser = require('less-symbols-parser');

const symbols = symbolsParser.parseSymbols('@a: 1;');
// console.log(symbols);
// {
//   variables: [ { name: '@a', value: '1', offset: 0 } ],
//   mixins: [],
//   imports: []
// }
```

## Symbols

**variable**

  * name: `string`
  * value: `string`
  * offset: `number`

**mixin**

  * name: `string`
  * parameters: `variable[]`
  * offset: `number`

**import**

  * filepath: `string`
  * modes: `string[]`
  * dynamic: `boolean` (filepath contains `@`, `{` or `}`)
  * css: `boolean` (filepath contains `css` extension or mode)

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/less-symbols-parser/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
