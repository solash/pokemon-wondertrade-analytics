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
			hiddenCount: 0,
			eggCount: 0,
			nicknameCount: 0,
			itemCount: 0,
			pokerusCount: 0,
			sixIVCount: 0,
			countries: {},
			levels: {}
		},
		attributeCountMappings = [
			['isShiny', 'shinyCount'],
			['hasHiddenAbility', 'hiddenCount'],
			['hasEggMove', 'eggCount'],
			['pokemonNickname', 'nicknameCount'],
			['hasItem', 'itemCount'],
			['hasPokerus', 'pokerusCount'],
			['hasPerfectIV', 'sixIVCount']
		];

	async.reduce(wonderTrades, result, function(memo, wonderTrade, callback) {

		memo.count++;

		// Checking and incrementing all the boolean counts
		attributeCountMappings.forEach(function(attributeAndCount){
			if (wonderTrade[attributeAndCount[0]]) {
				memo[attributeAndCount[1]]++;
			}
		});

		// Incrementing the country count
		if (!memo.countries[wonderTrade.trainerCountry]) {
			memo.countries[wonderTrade.trainerCountry] = 0;
		}
		memo.countries[wonderTrade.trainerCountry]++;

		// Incrementing the level count
		if (!memo.levels[wonderTrade.level]) {
			memo.levels[wonderTrade.level] = 0;
		}
		memo.levels[wonderTrade.level]++;

		callback(null, memo);
	}, callback);
};