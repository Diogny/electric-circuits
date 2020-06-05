import { isStr } from "./dab";

//... in progress ...
//npm https://www.npmjs.com/package/@dabberio/electric-units
export default class Unit {

	protected settings: { unit: number, prefix: number, value: number };

	//get unit name and symbol
	get name(): string { return Unit.unitNames[this.settings.unit] }
	get unit(): string { return Unit.unitSymbols[this.settings.unit] }
	get prefix(): string { return Unit.prefixSymbols[this.settings.prefix] }
	get exponent(): number { return Math.pow(10, Unit.prefixExponents[this.settings.prefix]) }
	get value(): number { return this.settings.value; }

	constructor(n: string) {
		if (!isStr(n) || !(n = n.trim()))
			throw `number ${n} must be a not empty string`;
		var
			ndx = n.length - 1,
			error = () => `invalid number: ${n}`,
			indexOf = (s: Array<string>, x: string, u: any) => s.indexOf(u ? x.toUpperCase() : x);
		//defaults
		this.settings = {
			unit: -1,
			prefix: -1,
			value: NaN
		};
		//extract unit
		//start with full name first
		if ((this.settings.unit = Unit.unitNames.findIndex(u => n.toUpperCase().endsWith(u.toUpperCase()))) >= 0) {
			ndx -= Unit.unitNames[this.settings.unit].length;
			//now try with unit symbols as is, and then uppercased
		} else if ((this.settings.unit = indexOf(Unit.unitSymbols, n[ndx], 0)) >= 0 ||
			(this.settings.unit = indexOf(Unit.unitSymbols, n[ndx], 1)) >= 0) {
			ndx--;
		} else
			throw error();

		//extract unit prefix
		if ((this.settings.prefix = Unit.prefixSymbols.indexOf(n[ndx])) == -1) {
			this.settings.prefix = 10;		// position of symbol and name: '', exponent: 0
			ndx++;
		}

		//last char has to be a number
		if (isNaN(parseInt(n[ndx - 1])))
			throw error();

		//extract number
		this.settings.value = parseFloat(n.substr(0, ndx));
	}

	public toString = (): string => {
		return `${this.value}${this.prefix}${this.unit}`;
	}

	//self sufficient dummy
	static split = (text: string): string[] => text.split('|');
	//prefixNames = ['yocto', 'zepto', 'atto', 'femto', 'pico', 'nano', 'micro', 'mili', 'centi', 'deci', '',
	//	'deca', 'hecto', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta', 'yotta'],
	static prefixSymbols = Unit.split('y|z|a|f|p|n|μ|m|c|d||da|h|k|M|G|T|P|E|Z|Y');
	//['y', 'z', 'a', 'f', 'p', 'n', 'μ', 'm', 'c', 'd', '',
	//'da', 'h', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
	static prefixExponents = [-24, -21, -18, -15, -12, -9, -6, -3, -2, -1, 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24];
	static unitNames = Unit.split('Ampere|Volt|Ohm|Farad|Watt|Henry|Meter');
	//['Ampere', 'Volt', 'Ohm', 'Farad', 'Watt', 'Henry', 'Meter'],
	static unitSymbols: string[] = Unit.split('A|V|Ω|F|W|H|m');
	//['A', 'V', 'Ω', 'F', 'W', 'H', 'm']
}