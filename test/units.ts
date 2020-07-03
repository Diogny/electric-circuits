import { expect } from 'chai';
import Unit from '../src/ts/units';

describe('Unit tests', () => {
	let
		unit = new Unit('2.5mm');
	console.log(`unit => ${unit.toString()}`);

	it('should return 2.5', () => {
		var result = unit.value;
		expect(result).to.equal(2.5);
	});

	it('should return m', () => {
		var result = unit.prefix;
		expect(result).to.equal("m");
	});

	it('should return m', () => {
		var result = unit.unit;
		expect(result).to.equal("m");
	});
})
