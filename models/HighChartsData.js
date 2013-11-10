var _ = require('underscore'),
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

var HighChartsData = function(jsonResults){

	this.jsonResults = jsonResults;

	var deserializedResults = [];			
	for(var i = 0, max =  jsonResults.length;i<max;i++) {				
		var currentWonderTrade = jsonResults[i];
		if(typeof currentWonderTrade === "string"
			&& currentWonderTrade.charAt(0) === '{'
			&& currentWonderTrade.charAt(currentWonderTrade.length-1) === '}') {
			deserializedResults.push(JSON.parse(currentWonderTrade));
		}
	}
	
	this.deserializedResults = deserializedResults;
};

HighChartsData.prototype.getCountsByCountries = function(){
	var trainerCountries = _.countBy(this.deserializedResults, 'trainerCountry'),
		countryChart = [];
	_.each(trainerCountries, function(countryCount, countryId) {
		countryChart.push([CountryHash[countryId], countryCount]);
	});

	return countryChart;
};

HighChartsData.prototype.getCountsByPokemon = function(){
	var pokemonByIds = _.countBy(this.deserializedResults, 'pokemonId')
		pokemonChart = [];
	_.each(pokemonByIds, function(pokemonByIdCount, pokemonId) {
		pokemonChart.push([PokemonHash[pokemonId], pokemonByIdCount]);				
	});

	return pokemonChart;
};


HighChartsData.prototype.getCountsByGender = function(){
	var trainerGender = _.countBy(this.deserializedResults, 'trainerGender');
	return [["Guys", trainerGender.male], ["Girls", trainerGender.female]];
};

HighChartsData.prototype.getCountTrendsByPokemon = function(){
	var pokemonGroupedByDate = {},
		trendingPokemonChart = [];
	// Split the results by Pokemon
	var wonderTradesByPokemon = _.groupBy(this.deserializedResults, function(wonderTrade){
		return wonderTrade.pokemonId;
	});

	// Then split those results by their dates.
	_.each(wonderTradesByPokemon, function(wonderTradeByDate, wonderTradeDate){
		pokemonGroupedByDate[wonderTradeDate] = _.countBy(wonderTradeByDate, 'date')
	});

	// And now.. we review each pokemon, and add their counts if available
	_.each(pokemonGroupedByDate, function(pokemonTradesByDate, pokemonId) {
		// Generic Literal Object to hold pokemon data
		var pokemonData = {
			name: PokemonHash[pokemonId],
			data: []
		};
		
		// We only care about this past week
		var today = new Date();
		for(var i=0, max=7;i<max;i++) {
			today.setDate(today.getDate()-1);
			if(pokemonTradesByDate[today.customFormatDate()]) {
				var dateField = Date.UTC(today.getFullYear(),  today.getMonth(), today.getDate()),
					countField = pokemonTradesByDate[today.customFormatDate()];
				pokemonData.data.push([dateField,countField]);
			} 
		}
		trendingPokemonChart.push(pokemonData);
	});

	return trendingPokemonChart;
};

exports.model = HighChartsData;