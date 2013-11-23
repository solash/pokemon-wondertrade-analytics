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

HighChartsData.prototype.getRegionsTable = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var trainerCountries = _.countBy(resultSet, 'trainerCountry'),
		countryChart = [];
	_.each(trainerCountries, function(countryCount, countryId) {
		countryChart.push({id: countryId, name: CountryHash[countryId], count: countryCount});
	});

	countryChart = _.sortBy(countryChart, function(itr){
		return itr.count;
	});

	return countryChart;
}

HighChartsData.prototype.getNicknamesTable = function() {
	return _.filter(this.deserializedResults, function(wonderTrade){		
		if(wonderTrade.pokemonNickname) {
			return wonderTrade;
		}
	});	
}

HighChartsData.prototype.getPokemonTable = function(resultSet) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var pokemonResults = _.countBy(resultSet, 'pokemonId'),
		pokemonTable = [];
	_.each(pokemonResults, function(pokemonCount, pokemonId) {
		pokemonTable.push({id:pokemonId, name: PokemonHash[pokemonId], count: pokemonCount});
	});

	pokemonTable = _.sortBy(pokemonTable, function(itr){
		return itr.count;
	});

	return pokemonTable;
}


HighChartsData.prototype.getSortedCountsByPokemon = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var pokemonByIds = _.countBy(resultSet, 'pokemonId'),
		pokemonChart = [];
	_.each(pokemonByIds, function(pokemonByIdCount, pokemonId) {
		pokemonChart.push([PokemonHash[pokemonId], pokemonByIdCount]);				
	});

	pokemonChart = _.sortBy(pokemonChart, function(itr){
		return itr[1];
	});

	return pokemonChart;
};

HighChartsData.prototype.getSortedCountsByPokemonId = function(resultSet){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var pokemonByIds = _.countBy(resultSet, 'pokemonId'),
		pokemonChart = [];
	_.each(pokemonByIds, function(pokemonByIdCount, pokemonId) {
		pokemonChart.push([pokemonId, pokemonByIdCount]);				
	});

	pokemonChart = _.sortBy(pokemonChart, function(itr){
		return itr[1];
	});

	return pokemonChart;
};

/* @param resultSet What is returned from the redis datastore
 * @param userTable A Json table of valid users.
 */

HighChartsData.prototype.getCountsByUserIdAndUserTable = function(resultSet, userTable){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var countsByUserId = _.countBy(resultSet, 'userId');
	_.each(countsByUserId, function(userIdCount, userId){		
		if(userTable[userId]) {
			userTable[userId].count = userIdCount;
		}
	});

	userTable = _.sortBy(userTable, 'count');
	userTable.reverse();	

	return userTable;

}

HighChartsData.prototype.getResultsByPokemonId = function(pokemonId) {
	pokemonId = parseInt(pokemonId);
	if(pokemonId > 0 && pokemonId < 719) {
		return _.where(this.deserializedResults, {pokemonId: parseInt(pokemonId)});	
	}
	return [];	
};

HighChartsData.prototype.getResultsByRegionId = function(regionId) {	
	if(CountryHash[regionId]) {
		return _.where(this.deserializedResults, {trainerCountry: regionId});	
	}
	return [];	
};

HighChartsData.prototype.getResultsByUserId = function(userId) {
	return _.where(this.deserializedResults, {userId: parseInt(userId)});
};

HighChartsData.prototype.getCountsBySubRegions = function(regionSet) {
	var subRegions = _.countBy(regionSet, function(wonderTrade){
		return wonderTrade.trainerCountrySub1;
	});

	var subRegionsChart = [];
	_.each(subRegions, function(subregionCount, regionName){
		if(regionName === '') {
			subRegionsChart.push(["n/a", subregionCount]);			
		} else {
			subRegionsChart.push([regionName, subregionCount]);			
		}		
	});

	subRegionsChart = _.sortBy(subRegionsChart, function(itr){
		return itr[1];
	});

	return subRegionsChart;
};

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
		levelsChart = [],
		levelsChartFormatted = [{
            name: 'Levels',
            data: []    
        }];	

    for(var i=1, max=100;i<=max;i++) {
    	levelsChart.push([i, 0]);
    }

	_.each(pokemonLevels, function(levelCount, level){
		var currentLevel = parseInt(level);

		if(currentLevel >= 1 && currentLevel <= 100) {
			levelsChart[currentLevel-1][1]+=levelCount;
		}
	});

	levelsChartFormatted[0].data = levelsChart;

	return levelsChartFormatted;
};

// @param pokemonSubSet: an array of pokemon we will filter on
HighChartsData.prototype.getCountTrendsByPokemon = function(resultSet, pokemonSubSet){
	var pokemonGroupedByDate = {},
		trendingPokemonChart = [],
		context = this;

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

	// And now.. we review each pokemon, and add their date/counts
	_.each(pokemonGroupedByDate, function(pokemonTradesByDate, pokemonId) {
		// Generic Literal Object to hold pokemon data
		var pokemonData = {
			name: PokemonHash[pokemonId],
			data: []
		};

		// If there is a subset we want to filter on, then lets filter.
		if(pokemonSubSet) {
			if(_.contains(pokemonSubSet, pokemonId)) {
				_.each(pokemonTradesByDate, function(dateFieldCount, dateField){
					pokemonData.data.push([context.formatDateFromString(dateField),dateFieldCount]);
				});
				
				pokemonData.data = _.sortBy(pokemonData.data, function(data) {				
					return data[0];
				});		
				trendingPokemonChart.push(pokemonData);
			}
		} else {
			_.each(pokemonTradesByDate, function(dateFieldCount, dateField){								
				pokemonData.data.push([context.formatDateFromString(dateField),dateFieldCount]);
			});		

			pokemonData.data = _.sortBy(pokemonData.data, function(data) {				
				return data[0];
			});					
			trendingPokemonChart.push(pokemonData);

			
		}
		
	});

	return trendingPokemonChart;
};

HighChartsData.prototype.getTrendsByDate = function(resultSet) {
	var trendChart = {
			name: "Wonder Trades",
			data: []
		},
		context = this;

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var wonderTradesByDate = _.groupBy(resultSet, function(wonderTrade){
		return wonderTrade.date;
	});

	_.each(wonderTradesByDate, function(dateCount, dateString) {
		var dateFieldCount = _.size(dateCount);
		trendChart.data.push([context.formatDateFromString(dateString),dateFieldCount]);		
	});

	trendChart.data = _.sortBy(trendChart.data, function(data) {				
		return data[0];
	});

	return trendChart;
};

HighChartsData.prototype.getTopTenPokemon = function(){
	var countTrends = this.getSortedCountsByPokemonId();
	countTrends = countTrends.reverse();	
	return _.first(countTrends,10);
};

HighChartsData.prototype.getPercentageByAttribute = function(attribute, resultSet) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var countsByAttribute = _.countBy(resultSet, attribute),
		totalSize = _.size(resultSet);
	if(!countsByAttribute.true) {
		countsByAttribute.true = 0;
	}		
	var percentage = ((countsByAttribute.true)/totalSize*100).toFixed(2);
	
	return percentage;
};

HighChartsData.prototype.getShinyPercentage = function(resultSet) {	
	return this.getPercentageByAttribute('isShiny', resultSet);
};

HighChartsData.prototype.getItemPercentage = function(resultSet) {
	return this.getPercentageByAttribute('hasItem', resultSet);
};

HighChartsData.prototype.getPokerusPercentage = function(resultSet) {
	return this.getPercentageByAttribute('hasPokerus', resultSet);
};

HighChartsData.prototype.getHiddenAbilityPercentage = function(resultSet) {
	return this.getPercentageByAttribute('hasHiddenAbility', resultSet);
};

HighChartsData.prototype.getQuickStats = function(resultSet) {	
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	return {
		resultCount: _.size(resultSet), 		
		shinyPercentage: this.getShinyPercentage(resultSet),
		hiddenAbilityPercentage: this.getHiddenAbilityPercentage(resultSet),
		itemPercentage: this.getItemPercentage(resultSet),
		pokerusPercentage: this.getPokerusPercentage(resultSet)
	};
};

HighChartsData.prototype.formatDateFromString = function(dateString){
	var formattedDate = dateString.split('-'),
		utcDate = Date.UTC(formattedDate[0], (parseInt(formattedDate[1])-1), formattedDate[2]);
	return utcDate;
};

exports.model = HighChartsData;