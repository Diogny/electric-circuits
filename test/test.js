'use strict';
var expect = require('chai').expect;
var Unit = require('../dist/src/units').default;
var dab = require('../dist/src/dab');

//console.log(Unit);
//console.log(dab.clamp);

describe('dab tests', () => {
	it('clamp(10, 0, 100) = 10', () => {
		var c = dab.clamp(10, 0, 100);
		expect(c).to.equal(10);
	});
	it('clamp(100, 0, 50) = 50', () => {
		var c = dab.clamp(100, 0, 50);
		expect(c).to.equal(50);
	})
});

describe('Electric unit class test', () => {
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

});