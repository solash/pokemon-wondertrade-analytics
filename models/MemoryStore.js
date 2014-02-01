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

var MemoryStore = function(redisStore) {
    this.redisStore = redisStore;
    this.store = {
        "highChartsData": new HighChartsData(),
        "highChartsResults": {},
        "PokemonList": PokemonList,
        "CountryList": CountryList,
        "PokemonHash": PokemonHash,
        "CountryHash": CountryHash
    };
};

// Refresh HighCharts Data from the RedisServer
MemoryStore.prototype.refreshHighCharts = function() {
    var self = this;

    if(this.redisStore) {
        this.redisStore.lrange('wondertrade' ,0, -1, function(error, result){
            self.store.highChartsData.refreshData(result);
            self.store.highChartsResults = result;
        });
    }
};

module.exports = MemoryStore;