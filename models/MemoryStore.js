/**
 * As the name suggests, the memoryStore model is used
 *  to cache data from the dataStore (redis)
 * @type {HighChartsData|exports}
 */
var HighChartsData = require('./HighChartsData'),
	PokemonList = require('../data/pokemonList.json'),
	CountryList = require('../data/countryList.json'),
	PokemonHash = {},
	CountryHash = {};

for(var pokemon in PokemonList) {
	PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
}

for(var country in CountryList) {
	CountryHash[CountryList[country].id] = CountryList[country].name;
}

/**
 * So here's the thing. Under the covers, fetching data from redis is blocking.
 * Rather than trying to fetch everything from redis in one fell swoop, which
 * ends up blocking GET / POST requests, I'm chunking it out smaller fetches.
 *
 * As a quick comparision with 125,226:
 * Getting everything at once: 52099.416ms (blocking)
 * Getting everything in chunks: 935.059ms (non-blocking)
 *
 * @param callback {Function} - return the collective sum of redis enteries to the highcharts function
 */
function getWonderTrades(index, max, step, result, redisStore, callback) {

	if (index >= max) {
		return callback(result);
	}

	redisStore.lrange('wondertrade' , index, index + step, function(error, chunk) {
		setTimeout(function() {
			getWonderTrades(index + step, max, step, result.concat(chunk), redisStore, callback);
		}, 1);
	});
}

var MemoryStore = function(redisStore) {
	this.redisStore = redisStore;
	this.store = {
		"highChartsData": new HighChartsData(PokemonHash, CountryHash),
		"highChartsSize": 0,
		"PokemonList": PokemonList,
		"CountryList": CountryList,
		"PokemonHash": PokemonHash,
		"CountryHash": CountryHash
	};
};

// Refresh HighCharts Data from the RedisServer
MemoryStore.prototype.refreshHighCharts = function() {

	var self = this;
	var highChartsSize;
	var redisStore = this.redisStore;
	var store = self.store;

	if(redisStore) {

		redisStore.llen('wondertrade', function(err, size) {
			highChartsSize = size;
			store.highChartsSize = size;

			// Fetch all the data in chunks
			getWonderTrades(0, highChartsSize, 1000, [], redisStore, function(result) {
				store.highChartsData.refreshData(result);
			});
		});
	}
};

module.exports = MemoryStore;