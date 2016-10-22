# less-symbols-parser

> A very simple and fast Less Symbols parser.

[![Travis Status](https://travis-ci.org/mrmlnc/less-symbols-parser.svg?branch=master)](https://travis-ci.org/mrmlnc/less-symbols-parser)

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
