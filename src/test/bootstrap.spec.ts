'use strict';

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

import { parseSymbols } from '../index';

describe('Bootstrap', () => {

	const dir = './node_modules/bootstrap/less';

	it('Files without symbols', () => {
		let status = true;
		const files: string[] = [];

		fs.readdirSync(dir).filter((filename) => {
			return !/bootstrap|mixins|variables|theme/.test(filename);
		}).forEach((filename) => {
			const data = fs.readFileSync(path.join(dir, filename)).toString();
			const symbols = parseSymbols(data);
			if (symbols.imports.length !== 0 || symbols.mixins.length !== 0 || symbols.variables.length !== 0) {
				status = false;
				files.push(filename);
			}
		});

		assert.ok(status, files.join());
	});

	it('Files with symbols', () => {
		const expected = {
			'bootstrap.less': {
				variables: 0,
				mixins: 0,
				imports: 39
			},
			'mixins.less': {
				variables: 0,
				mixins: 0,
				imports: 30
			},
			'variables.less': {
				variables: 387,
				mixins: 0,
				imports: 0
			},
			'theme.less': {
				variables: 0,
				mixins: 4,
				imports: 2
			}
		};

		const current: Record<string, any> = {};
		['bootstrap.less', 'mixins.less', 'variables.less', 'theme.less'].forEach((filename) => {
			const data = fs.readFileSync(path.join(dir, filename)).toString();
			const symbols = parseSymbols(data);

			current[filename] = {
				variables: symbols.variables.length,
				mixins: symbols.mixins.length,
				imports: symbols.imports.length
			};
		});

		assert.deepEqual(expected, current);
	});

	it('Mixins', () => {
		let symbolsCount = 0;

		fs.readdirSync(path.join(dir, 'mixins')).forEach((filename) => {
			const data = fs.readFileSync(path.join(dir, 'mixins', filename)).toString();
			const symbols = parseSymbols(data);

			symbolsCount += symbols.imports.length + symbols.mixins.length + symbols.variables.length;
		});

		assert.equal(symbolsCount, 98);
	});

});
