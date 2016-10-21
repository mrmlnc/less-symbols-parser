'use strict';

import tokenizer from './tokenizer';

export interface IVariable {
	name: string;
	value: string;
	line: number;
	column: number;
}

export interface IImport {
	filepath: string;
	modes: string[];
	dynamic: boolean;
	css: boolean;
}

export interface IMixin {
	name: string;
	parameters: IVariable[];
	line: number;
	column: number;
}

function makeMixinParameter(text: string, line: number, column: number): IVariable[] {
	if (text === '()') {
		return [];
	}

	const params = text.slice(1, text.length - 1).split(/,\s*|;\s*/);
	const variables = params.map((x) => {
		const stat = x.match(/(@[\w-]+)(?:\s*:\s*(.*))?/);

		return <IVariable>{
			name: stat[1],
			value: stat[2] || null,
			line,
			column
		};
	});

	return variables;
}

export function parseSymbols(text: string) {
	const tokens = tokenizer(text);

	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];
	let imports: IImport[] = [];

	let token;
	let pos = 0;

	let line = 1;

	const length = tokens.length;

	while (pos < length) {
		token = tokens[pos];

		if (token[0] === 'at-word' && token[1] === '@import') { // Import's
			pos++;

			let str = '';
			while (pos < length) {
				token = tokens[pos];
				if (token[0] === ';') {
					break;
				}
				str += token[1];
				pos++;
			}
			const stat = str.match(/(?:\(([\w-,\s]+)\))?\s['"](.*)['"]/);

			if (!stat) {
				continue;
			}

			const modes = stat[1] ? stat[1].split(/,\s*/) : [];

			imports.push({
				filepath: stat[2],
				modes,
				dynamic: /[@{}\*]/.test(stat[2]),
				css: /\.css$/.test(stat[2]) || modes.indexOf('css') !== -1
			});
		} else if (token[0] === 'at-word' && token[1].endsWith(':')) { // Variables
			line = token[2];
			pos++;

			const name = token[1].slice(0, -1);
			const column = token[3];

			let value = '';
			while (pos < length && tokens[pos][0] !== ';') {
				token = tokens[pos];

				if (token[0] === '{') {
					let ruleset = 1;

					value += '{';

					pos++;
					while (pos < length) {
						token = tokens[pos];
						if (token[0] === ';' && ruleset === 0) {
							break;
						} else if (token[0] === '{') {
							ruleset++;
						} else if (token[0] === '}') {
							ruleset--;

							if (ruleset === 0) {
								value += '}';
								break;
							}
						}

						value += token[1].replace(/\t/g, '');
						pos++;
					}
				} else if (token[0] === 'word' || token[0] === 'at-word' || token[0] === 'string' || token[0] === 'space') {
					value += token[1];
				}
				pos++;
			}

			variables.push({
				name,
				value: value.trim(),
				line,
				column
			});
		} else if (token[0] === 'word' && (token[1].startsWith('.') || token[1].startsWith('#'))) { // Potential Mixin
			const column = token[3];
			let paramsColumn = column;

			line = token[2];

			let name = '';
			while (pos < length) {
				token = tokens[pos];
				if (token[0] === ':' || token[0] === 'brackets' || token[0] === '(' || token[0] === '{') {
					break;
				}
				name += token[1];
				pos++;
			}

			let params = '';
			if (token[0] === 'brackets') {
				paramsColumn = token[3];
				params = token[1];
			} else if (token[0] === '(') {
				paramsColumn = token[3];
				pos++;
				while (pos < length) {
					token = tokens[pos];
					if (token[0] === ')') {
						break;
					}

					params += token[1];
					pos++;
				}

				params = `(${params})`;
			}

			if (tokens[pos + 1][0] === ';' || tokens[pos + 2][0] === ';') {
				pos++;
				continue;
			}

			if (name && params) {
				mixins.push({
					name: name.trim(),
					parameters: makeMixinParameter(params, line, paramsColumn),
					line,
					column
				});
			} else {
				pos--;
			}
		} else if (token[0] === '{') { // Ruleset
			let ruleset = 1;

			pos++;
			while (pos < length) {
				token = tokens[pos];
				if (ruleset === 0) {
					break;
				} else if (token[0] === '{') {
					ruleset++;
				} else if (token[0] === '}') {
					ruleset--;
				}
				pos++;
			}
		}

		pos++;
	}

	return {
		variables,
		mixins,
		imports
	};
}
