'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import parser from '../index';

describe('Parser', () => {

	it('Variables', () => {
		const data = fs.readFileSync('./fixtures/variables.less').toString();

		const { variables } = parser.parse(data);

		const expected = [
			{ name: '@a', value: '1', line: 2, column: 1 },
			{ name: '@b', value: '@a', line: 3, column: 1 },
			{ name: '@c', value: 'text', line: 4, column: 1 },
			{ name: '@d', value: '"text"', line: 5, column: 1 },
			{ name: '@e', value: '"@test:1;"', line: 6, column: 1 },
			{
				name: '@f',
				value: '"{ content" "\\{ content \\}" "\\{ content }" "\\" content \\}" "\\\\" "@{c}"',
				line: 7,
				column: 1
			},
			{
				name: '@g',
				value: '{\n@skip: me;\ncontent: "";\n\n.test {\n@skip: me;\n}\n}',
				line: 8,
				column: 1
			},
			{ name: '@h', value: '1, 2, 3', line: 16, column: 1 },
			{ name: '@i', value: '1 2 3', line: 17, column: 1 },
			{ name: '@j', value: '@a !important', line: 18, column: 5 },
			{ name: '@k', value: '\\\\', line: 19, column: 1 },
			{ name: '@l', value: '\\\\\\test', line: 20, column: 1 },
			{ name: '@n', value: 'end', line: 24, column: 2 },
			{ name: '@q', value: '1', line: 32, column: 1 }
		];

		assert.deepEqual(variables, expected);
	});

	it('Mixins', () => {
		const data = fs.readFileSync('./fixtures/mixins.less').toString();

		const { mixins } = parser.parse(data);

		const expected = [
			{ name: '.b', parameters: [], line: 4, column: 1 },
			{
				name: '.c',
				parameters: [
					{ name: '@a', value: null, line: 9, column: 4 },
					{ name: '@b', value: null, line: 9, column: 4 },
					{ name: '@c', value: null, line: 9, column: 4 }
				],
				line: 9,
				column: 1
			},
			{
				name: '.d',
				parameters: [
					{ name: '@a', value: '"{()}"', line: 12, column: 2 }
				],
				line: 12,
				column: 1
			},
			{
				name: '#f',
				parameters: [
					{ name: '@hm', value: '"broken highlighting in VS Code"', line: 20, column: 6 }
				],
				line: 20,
				column: 4
			}
		];

		assert.deepEqual(mixins, expected);
	});

	it('Imports', () => {
		const data = fs.readFileSync('./fixtures/imports.less').toString();

		const { imports } = parser.parse(data);

		const expected = [
			{ filepath: 'test.less', modes: [], dynamic: false },
			{ filepath: 'test', modes: ['css'], dynamic: false },
			{
				filepath: 'test.less',
				modes: ['optional', 'reference'],
				dynamic: false
			},
			{ filepath: '@{test}.less', modes: [], dynamic: true }
		];

		assert.deepEqual(imports, expected);
	});

	it('Comments', () => {
		const data = fs.readFileSync('./fixtures/comments.less').toString();

		const symbols = parser.parse(data);

		const expected = {
			variables: [],
			mixins: [],
			imports: []
		};

		assert.deepEqual(symbols, expected);
	});

	it('Loop', () => {
		const data = fs.readFileSync('./fixtures/loop.less').toString();

		const symbols = parser.parse(data);

		const expected = {
			variables: [
				{ name: '@a', value: '1', line: 1, column: 1 },
				{ name: '@b', value: '2', line: 2, column: 1 }
			],
			mixins: [
				{ name: '.test', parameters: [], line: 3, column: 1 }
			],
			imports: []
		};

		assert.deepEqual(expected, symbols);
	});

});
