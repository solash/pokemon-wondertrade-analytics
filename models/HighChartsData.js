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
	this.pokemonList = PokemonList;
};

HighChartsData.prototype.getSortedCountsByCountries = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var trainerCountries = _.countBy(resultSet, 'trainerCountry'),
		countryChart = [];
	_.each(trainerCountries, function(countryCount, countryId) {
		countryChart.push([CountryHash[countryId], countryCount]);
	});

	countryChart = _.sortBy(countryChart, function(itr){
		return itr[1];
	});

	return countryChart;
};

HighChartsData.prototype.getSortedCountsByPokemon = function(){
	var pokemonByIds = _.countBy(this.deserializedResults, 'pokemonId'),
		pokemonChart = [];
	_.each(pokemonByIds, function(pokemonByIdCount, pokemonId) {
		pokemonChart.push([PokemonHash[pokemonId], pokemonByIdCount]);				
	});

	pokemonChart = _.sortBy(pokemonChart, function(itr){
		return itr[1];
	});

	return pokemonChart;
};

HighChartsData.prototype.getResultsByPokemonId = function(pokemonId) {
	pokemonId = parseInt(pokemonId);
	if(pokemonId > 0 && pokemonId < 719) {
		return _.where(this.deserializedResults, {pokemonId: parseInt(pokemonId)});	
	}
	return [];	
}

HighChartsData.prototype.getCountsByGender = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var trainerGender = _.countBy(resultSet, 'trainerGender');
	return [["Guys", trainerGender.male], ["Girls", trainerGender.female]];
};

HighChartsData.prototype.getCountsByLevels = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var pokemonLevels = _.countBy(resultSet, 'level'),
		levelsChart = [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		levelsChartFormatted = [{
            name: 'Levels',
            data: []    
        }];	

	_.each(pokemonLevels, function(levelCount, level){
		var currentLevel = parseInt(level),
			roundedLevel = Math.floor(currentLevel/10);

		if(roundedLevel >= 0 && roundedLevel < 10) {
			levelsChart[roundedLevel]+=levelCount;
		}
	});

	levelsChartFormatted[0].data = levelsChart;

	return levelsChartFormatted;
};

HighChartsData.prototype.getCountTrendsByPokemon = function(resultSet){
	var pokemonGroupedByDate = {},
		trendingPokemonChart = [];

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	// Split the results by Pokemon
	var wonderTradesByPokemon = _.groupBy(resultSet, function(wonderTrade){
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

HighChartsData.prototype.getTopTenPokemon = function(){
	var countTrends = this.getSortedCountsByPokemon();
	countTrends = countTrends.reverse();
	return _.first(countTrends,5);
};

HighChartsData.prototype.getPercentageByAttribute = function(attribute) {
	var countsByAttribute = _.countBy(this.deserializedResults, attribute),
		totalSize = _.size(this.deserializedResults),
		percentage = ((countsByAttribute.true)/totalSize*100).toFixed(2);

	return percentage;
};

HighChartsData.prototype.getShinyPercentage = function() {	
	return this.getPercentageByAttribute('isShiny');
};

HighChartsData.prototype.getItemPercentage = function() {
	return this.getPercentageByAttribute('hasItem');
};

HighChartsData.prototype.getPokerusPercentage = function() {
	return this.getPercentageByAttribute('hasPokerus');
};

HighChartsData.prototype.getHiddenAbilityPercentage = function() {
	return this.getPercentageByAttribute('hasHiddenAbility');
};

exports.model = HighChartsData;