'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import { parseSymbols } from '../index';

describe('Parser', () => {

	it('Variables', () => {
		const data = fs.readFileSync('./fixtures/variables.less').toString();

		const { variables } = parseSymbols(data);

		const expected = [
			{ name: '@a', value: '1', offset: 8 },
			{ name: '@b', value: '@a', offset: 15 },
			{ name: '@c', value: 'text', offset: 23 },
			{ name: '@d', value: '"text"', offset: 33 },
			{ name: '@e', value: '"@test:1;"', offset: 45 },
			{
				name: '@f',
				value: '"{ content" "\\{ content \\}" "\\{ content }" "\\" content \\}" "\\\\" "@{c}"',
				offset: 61
			},
			{
				name: '@g',
				value: '{\n@skip: me;\ncontent: "";\n\n.test {\n@skip: me;\n}\n}',
				offset: 137
			},
			{ name: '@h', value: '1, 2, 3', offset: 198 },
			{ name: '@i', value: '1 2 3', offset: 211 },
			{ name: '@j', value: '@a !important', offset: 226 },
			{ name: '@k', value: '\\\\', offset: 245 },
			{ name: '@l', value: '\\\\\\test', offset: 253 },
			{ name: '@n', value: 'end', offset: 288 },
			{ name: '@q', value: '1', offset: 357 },
			{ name: '@r', value: '1', offset: 401 },
			{ name: '@s', value: '@r', offset: 407 }
		];

		assert.deepEqual(variables, expected);
	});

	it('Mixins', () => {
		const data = fs.readFileSync('./fixtures/mixins.less').toString();

		const { mixins } = parseSymbols(data);

		const expected = [
			{ name: '.b', parameters: [], offset: 21 },
			{
				name: '.c',
				parameters: [
					{ name: '@a', value: null, offset: 51 },
					{ name: '@b', value: null, offset: 55 },
					{ name: '@c', value: 'rgba(0,0,0,0)', offset: 58 }
				],
				offset: 47
			},
			{
				name: '.d',
				parameters: [
					{ name: '@a', value: '"{()}"', offset: 100 }
				],
				offset: 95
			},
			{
				name: '#f',
				parameters: [
					{ name: '@hm', value: '"broken highlighting in VS Code"', offset: 163 }
				],
				offset: 160
			},
			{
				name: '.one',
				parameters: [
					{ name: '@a', value: '1', offset: 225 },
					{ name: '@b', value: 'rgba(0,0,0,0)', offset: 232 }
				],
				offset: 220
			},
			{
				name: '.two',
				parameters: [
					{ name: '@a', value: '1', offset: 261 },
					{ name: '@b', value: 'rgba(0,0,0,0)', offset: 269 }
				],
				offset: 254
			}
		];

		assert.deepEqual(mixins, expected);
	});

	it('Imports', () => {
		const data = fs.readFileSync('./fixtures/imports.less').toString();

		const { imports } = parseSymbols(data);

		const expected = [
			{ filepath: 'test.less', modes: [], dynamic: false, css: false },
			{ filepath: 'test.css', modes: [], dynamic: false, css: true },
			{ filepath: 'test', modes: ['css'], dynamic: false, css: true },
			{
				filepath: 'test.less',
				modes: ['optional', 'reference'],
				dynamic: false,
				css: false
			},
			{ filepath: '@{test}.less', modes: [], dynamic: true, css: false }
		];

		assert.deepEqual(imports, expected);
	});

	it('Comments', () => {
		const data = fs.readFileSync('./fixtures/comments.less').toString();

		const symbols = parseSymbols(data);

		const expected = {
			variables: [],
			mixins: [],
			imports: []
		};

		assert.deepEqual(symbols, expected);
	});

	it('Loop', () => {
		const data = fs.readFileSync('./fixtures/loop.less').toString();

		const symbols = parseSymbols(data);

		const expected = {
			variables: [
				{ name: '@a', value: '1', offset: 0 },
				{ name: '@b', value: '2', offset: 7 }
			],
			mixins: [
				{ name: '.test', parameters: [], offset: 14 }
			],
			imports: []
		};

		assert.deepEqual(expected, symbols);
	});

	it('Dot', () => {
		const data = fs.readFileSync('./fixtures/dot.less').toString();

		const symbols = parseSymbols(data);

		const expected = {
			variables: [],
			mixins: [],
			imports: []
		};

		assert.deepEqual(expected, symbols);
	});

});
