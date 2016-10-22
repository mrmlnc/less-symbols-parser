'use strict';

import tokenizer from './tokenizer';

export interface IVariable {
	name: string;
	value: string;
	offset: number;
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
	offset: number;
}

export function parseSymbols(text: string) {
	const tokens = tokenizer(text);

	let variables: IVariable[] = [];
	let mixins: IMixin[] = [];
	let imports: IImport[] = [];

	let token;
	let pos = 0;

	let offset = 0;

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
			offset = token[2];
			pos++;

			const name = token[1].slice(0, -1);

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
				offset
			});
		} else if (token[0] === 'word' && (token[1].startsWith('.') || token[1].startsWith('#'))) { // Potential Mixin
			offset = token[2];

			let name = '';
			while (pos < length) {
				token = tokens[pos];
				if (token[0] === ':' || token[0] === 'brackets' || token[0] === '(' || token[0] === '{') {
					break;
				}
				name += token[1];
				pos++;
			}

			let isMixin = false;
			const parameters: IVariable[] = [];
			if (token[0] === 'brackets') {
				isMixin = true;
			} else if (token[0] === '(') {
				isMixin = true;

				let paramsOffset = token[2];
				let paramsName = '';
				let paramsValue = '';

				pos++;
				while (pos < length) {
					token = tokens[pos];
					if (token[0] === 'at-word' && token[1].endsWith(',')) {
						token[1] = token[1].slice(0, -1);
						tokens.splice(pos + 1, 0, [',', ',', token[2] + paramsName.length]);

						// Return to previous position
						pos--;
					} else if (token[0] === ',' || token[0] === ';' || token[0] === ')') {
						parameters.push({
							name: paramsName,
							value: paramsValue || null,
							offset: paramsOffset
						});

						if (token[0] === ')') {
							break;
						}

						paramsName = '';
						paramsValue = '';
					} else if (token[0] === 'at-word') {
						paramsOffset = token[2];
						paramsName = token[1].endsWith(':') ? token[1].slice(0, -1) : token[1];
					} else if (token[0] !== 'space') {
						paramsValue += token[1];
					}

					pos++;
				}
			}

			if ((tokens[pos + 1] && tokens[pos + 1][0] === ';') || (tokens[pos + 2] && tokens[pos + 2][0] === ';')) {
				pos++;
				continue;
			}

			if (name && isMixin) {
				mixins.push({
					name: name.trim(),
					parameters,
					offset
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
