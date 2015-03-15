
var assert = require('assert'),
	ParsedCounts = require('../../models/parsedWonderTradeCounts'),
	dummyData = require('../../data/wondertrades-03142015');

describe('Parsed Wonder Trade Counts', function(){

	it('should parse all the wonder trades', function(done) {
		ParsedCounts(dummyData, function(err, result){
			assert.equal(err, null);
			assert.equal(result.count, dummyData.length);
			done();
		});
	});

	it('should get level data', function(done) {
		ParsedCounts(dummyData, function(err, result){
			assert.notEqual(result.levels['1'], 0);
			assert.notEqual(result.levels['100'], 0);
			assert.equal(result.levels['93'], undefined);
			done();
		});
	});

	it('should get country data', function(done) {
		ParsedCounts(dummyData, function(err, result){
			assert.notEqual(result.countries['US'], undefined);
			assert.notEqual(result.countries['TT'], undefined);
			done();
		});
	});

	it('should parse all a different array of wonder trades', function(done) {
		// This is a much smaller subset of wonder trades.
		ParsedCounts(dummyData.slice(0,10), function(err, result){
			assert.equal(err, null);
			assert.equal(result.count, 10);

			assert.equal(result.countries['TT'], undefined);
			done();
		});
	});
});