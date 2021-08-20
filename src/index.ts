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

function makeMixinParameters(text: string, offset: number): IVariable[] {
	const variables: IVariable[] = [];
	if (text === '()') {
		return variables;
	}

	// Remove parenthesis
	text = text.slice(1, text.length - 1);
	const params = text.split(/([,;]\s*)(?=@)/);

	// Skip `(`
	offset += 1;

	for (let i = 0; i < params.length; i = i + 2) {
		const token = params[i];
		const stat = token.match(/([\n\t\r\s]*)(@[\w-]+)(?:\s*:\s*(.*))?/);

		offset += stat[1].length || 0;

		variables.push({
			name: stat[2],
			value: stat[3] ? stat[3].trim() : null,
			offset
		});

		offset += token.trim().length + (params[i + 1] ? params[i + 1].length : 0);
	}

	return variables;
}

function parseSymbols(text: string) {
	const tokens = tokenizer(text);

	const variables: IVariable[] = [];
	const mixins: IMixin[] = [];
	const imports: IImport[] = [];

	let token;
	let pos = 0;

	let offset = 0;

	const length = tokens.length;

	// RegExp's
	const reImportStat = /(?:\(([\w-,\s]+)\))?\s['"](.*)['"]/;
	const reImportDynamic = /[@{}\*]/;

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

			const stat = str.match(reImportStat);
			if (!stat) {
				continue;
			}

			const modes = stat[1] ? stat[1].split(/,\s*/) : [];

			imports.push({
				filepath: stat[2],
				modes,
				dynamic: reImportDynamic.test(stat[2]),
				css: /\.css$/.test(stat[2]) || modes.indexOf('css') !== -1
			});
		} else if (token[0] === 'at-word' && token[1].indexOf(':') !== -1 && !token[1].endsWith(':')) { // Variables without space after colon
			const colonIndex = token[1].indexOf(':') + 1;
			const value = token[1].substr(colonIndex);

			// Update current token
			token[1] = token[1].substring(0, colonIndex);

			// Create new token after current token
			tokens.splice(pos + 1, 0, ['string', value, null]);

			// One step back
			pos--;
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
				} else if (token[0] === 'word' || token[0] === 'at-word' || token[0] === 'string' || token[0] === 'space' || token[0] === 'brackets') {
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

			let paramsOffset = offset;
			let params = '';
			if (token[0] === 'brackets') {
				paramsOffset = token[2];
				params = token[1];
			} else if (token[0] === '(') {
				paramsOffset = token[2];
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

			// Skip Mixin reference
			let c = 0;
			let next = pos;
			while (next < length) {
				token = tokens[next];

				if (token[0] === '{') {
					break;
				} else if (token[0] === ';') {
					c = 3;
					break;
				} else if (token[0] !== 'word' && token[0] !== 'space' && token[0] !== 'brackets') {
					c++;
				}

				next++;
			}

			// Mixin declaration can only be:
			//  * `()` + `space when/and/or/()` + `{`
			//  * `()` + `space` + `{`
			//  * `()` + `{`
			if (c > 2 || next === length) {
				pos++;
				continue;
			}

			let parameters: IVariable[] = [];

			try {
				parameters = makeMixinParameters(params, paramsOffset);
			} catch (error) {
				// console.warn(error.message);
			}

			if (name && params) {
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

export {
	parseSymbols,
	tokenizer
};
