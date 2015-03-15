var async = require('async');

/**
 * Provided an array of wondertrades, this function will return an object literal containing parsed wondertrade counts
 *
 * @param wonderTrades
 * @returns {JSON} - populated results object
 */
module.exports = function(wonderTrades, callback) {

	var result =  {
		count: 0,
		shinyCount: 0,
		countries: {},
		levels: {}
	};

	async.reduce(wonderTrades, result, function(memo, wonderTrade, callback) {
		memo.count++;
		if (wonderTrade.isShiny) {
			memo.shinyCount++;
		}

		if (!memo.countries[wonderTrade.trainerCountry]) {
			memo.countries[wonderTrade.trainerCountry] = 0;
		}
		memo.countries[wonderTrade.trainerCountry]++;

		if (!memo.levels[wonderTrade.level]) {
			memo.levels[wonderTrade.level] = 0;
		}
		memo.levels[wonderTrade.level]++;

		callback(null, memo);
	}, callback);
};