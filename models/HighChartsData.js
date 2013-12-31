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
	this.dailyThreshold = 15;
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

HighChartsData.prototype.getCountsByUserIdAndUserTableFormatted = function(resultSet, userTable){
    if(!resultSet) {
        resultSet = this.deserializedResults;
    }
    var formattedResults = [];

    var countsByUserId = _.countBy(resultSet, 'userId');
    _.each(countsByUserId, function(userIdCount, userId){
        if(userTable[userId] && userIdCount > 0) {
            formattedResults.push([ userTable[userId], userIdCount ]);
        }
    });

    formattedResults = _.sortBy(formattedResults, function(userResult){
        return userResult[1];
    });

    return formattedResults;

}

HighChartsData.prototype.getResultsByPokemonId = function(pokemonId) {
	pokemonId = parseInt(pokemonId);
	if(pokemonId > 0 && pokemonId < 719) {
		return _.where(this.deserializedResults, {pokemonId: parseInt(pokemonId)});	
	}
	return [];	
};

HighChartsData.prototype.getResultsWithHiddenAbilities = function() {
	return _.where(this.deserializedResults, {hasHiddenAbility: true});
};

HighChartsData.prototype.getResultsWithPerfectIV = function() {
	return _.where(this.deserializedResults, {hasPerfectIV: true});
};

HighChartsData.prototype.getResultsByPokemonLevel = function(pokemonLevel) {
	pokemonLevel = parseInt(pokemonLevel);
	if(pokemonLevel > 0 && pokemonLevel <= 100) {
		return _.where(this.deserializedResults, {level: pokemonLevel});	
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

HighChartsData.prototype.getResultsByUserIdAndSubmissionDate = function(userId, submissionDate) {
	return _.where(this.deserializedResults, {userId: parseInt(userId), date: submissionDate});
};

HighChartsData.prototype.getResultsBySubmissionDate = function(submissionDate) {
	return _.where(this.deserializedResults, {date: submissionDate});
};

HighChartsData.prototype.getResultsByGender = function(gender) {
	return _.where(this.deserializedResults, {trainerGender: gender});
};

HighChartsData.prototype.getResultsByDate = function(date){
    return _.where(this.deserializedResults, {date: date});
};

HighChartsData.prototype.getResultsByDateRange = function(startDate, endDate){
    return _.filter(this.deserializedResults, function(result){
        var resultDate =result.date;
        return (resultDate >= startDate && resultDate <= endDate);
    });
};

HighChartsData.prototype.getNicknamesByResultSet = function(resultSet){
    if(!resultSet) {
        resultSet = this.deserializedResults;
    }
    var reduced = _.filter(resultSet, function(pokemon){
        return pokemon.pokemonNickname !== '';
    });
    return _.pluck(reduced, 'pokemonNickname');
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
        totalCountsByDate = {},
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

		var startDate = new Date(2013, 10, 21),
			endDate = new Date(),
			fullDateRange = [];
		while(startDate < endDate) {
			fullDateRange.push([context.formatDateFromString(startDate.customFormatDate()), 0]);
			startDate.setDate(startDate.getDate()+1);
		}

		// If there is a subset we want to filter on, then lets filter.
		if(pokemonSubSet) {
			if(_.contains(pokemonSubSet, pokemonId)) {
				_.each(pokemonTradesByDate, function(dateFieldCount, dateField){
                    if (!totalCountsByDate[dateField]) {
                        totalCountsByDate[dateField] = (context.getResultsByDate(dateField)).length;
                    }
                    var countPercent = (dateFieldCount/totalCountsByDate[dateField]*100);
                    countPercent = parseFloat(countPercent.toFixed(2));

					if(totalCountsByDate[dateField] > context.dailyThreshold) {
						_.each(fullDateRange, function(tempDate){
							if(context.formatDateFromString(dateField) === tempDate[0]) {
								tempDate[1] = countPercent;
							}
						});
					}
				});
				
				pokemonData.data = fullDateRange;
				trendingPokemonChart.push(pokemonData);
			}
		} else {
			_.each(pokemonTradesByDate, function(dateFieldCount, dateField){
                if (!totalCountsByDate[dateField]) {
                    totalCountsByDate[dateField] = (context.getResultsByDate(dateField)).length;
                }
                var countPercent = (dateFieldCount/totalCountsByDate[dateField]*100);
                countPercent = parseFloat(countPercent.toFixed(2));

				_.each(fullDateRange, function(tempDate){
					if(context.formatDateFromString(dateField) === tempDate[0]) {
						tempDate[1] = countPercent;
					}
				});
			});		

			pokemonData.data = fullDateRange;
			trendingPokemonChart.push(pokemonData);
		}
		
	});

	return trendingPokemonChart;
};

HighChartsData.prototype.getCountTrendsByUsers = function(resultSet, userTable, startDateOverride, endDateOverride){
	var usersGroupedByDate = {},
		trendingPokemonChart = [],
		context = this;

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	// Split the results by UserId
	var wonderTradesByUserId = _.groupBy(resultSet, function(wonderTrade){
		return wonderTrade.userId;
	});

	// Then split those results by their dates.
	_.each(wonderTradesByUserId, function(wonderTradeByDate, wonderTradeDate){
		usersGroupedByDate[wonderTradeDate] = _.countBy(wonderTradeByDate, 'date')
	});

	// And now.. we review each pokemon, and add their date/counts
	_.each(usersGroupedByDate, function(pokemonTradesByDate, userId) {
		// Generic Literal Object to hold pokemon data
		var pokemonData = {
			name: userTable[userId].username,
			data: [],
			fullCount: 0
		};

		var startDate = (startDateOverride ? new Date(startDateOverride) : new Date(2013, 10, 21) ),
			endDate = (endDateOverride ? new Date(endDateOverride) : new Date() ),
			fullDateRange = [];
		while(startDate < endDate) {
			fullDateRange.push([context.formatDateFromString(startDate.customFormatDate()), 0]);
			startDate.setDate(startDate.getDate()+1);
		}

		// If there is a subset we want to filter on, then lets filter!
		_.each(pokemonTradesByDate, function(dateFieldCount, dateField){
			_.each(fullDateRange, function(tempDate){
				if(context.formatDateFromString(dateField) === tempDate[0]) {
					tempDate[1] = dateFieldCount;
				}
			});
			pokemonData.fullCount += dateFieldCount;
		});

		pokemonData.data = fullDateRange;
		trendingPokemonChart.push(pokemonData);		
	});

	return trendingPokemonChart;
};

HighChartsData.prototype.getSubmissionDates = function(resultSet) {
	var submissionDates = [],
		context = this;

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var wonderTradesByDate = _.groupBy(resultSet, function(wonderTrade){
		return wonderTrade.date;
	});

	_.each(wonderTradesByDate, function(dateCount, dateString) {		
		var dateFieldCount = _.size(dateCount),
			submission = {
				dateString: dateString,
				formattedDate: context.formatDateFromString(dateString),
				count: dateFieldCount
			};
		submissionDates.push(submission);
	});

	submissionDates = _.sortBy(submissionDates, function(data) {				
		return data.formattedDate;
	});

	return submissionDates;
};

HighChartsData.prototype.getTrendsByDate = function(resultSet) {
	var trendChart = {
			name: "Wonder Trades",
			data: []
		},
		context = this;

	var startDate = new Date(2013, 10, 21),
		endDate = new Date(),
		fullDateRange = [];
	while(startDate < endDate) {
		fullDateRange.push([context.formatDateFromString(startDate.customFormatDate()), 0]);
		startDate.setDate(startDate.getDate()+1);
	}

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var wonderTradesByDate = _.groupBy(resultSet, function(wonderTrade){
		return wonderTrade.date;
	});

	_.each(wonderTradesByDate, function(dateCount, dateString) {
		var dateFieldCount = _.size(dateCount);
		_.each(fullDateRange, function(tempDate){
			if(context.formatDateFromString(dateString) === tempDate[0]) {
				tempDate[1] = dateFieldCount;
			}
		});
	});

	trendChart.data = fullDateRange;

	return trendChart;
};

HighChartsData.prototype.getTopTenPokemon = function(){
	var countTrends = this.getSortedCountsByPokemonId();
	countTrends = countTrends.reverse();	
	return _.first(countTrends,10);
};

HighChartsData.prototype.getCommunityLikes = function(resultSet){
    var communityOpinion = [];
    if(!resultSet) {
        resultSet = this.deserializedResults;
    }

    var wonderTradesByPokemon = _.groupBy(resultSet, function(wonderTrade){
        return wonderTrade.pokemonId;
    });

    _.each(wonderTradesByPokemon, function(pokemonList, pokemonId){
        var likedCounts = _.countBy(pokemonList, function(pokemon){
            if(pokemon.liked === "like" || pokemon.liked === "dislike"){
                return pokemon.liked;
            }
        });

        // Preset 0 likes and dislikes
        likedCounts = _.extend({like: 0, dislike: 0}, likedCounts);

        var likes = likedCounts.like,
            dislikes = likedCounts.dislike;

        if(likes || dislikes) {
            var likePercentage = (likes / (likes+dislikes)*100).toFixed(2);
            communityOpinion.push([PokemonHash[pokemonId], likePercentage]);
        }
    });

    communityOpinion = _.sortBy(communityOpinion, function(pokemonData){
        return pokemonData[1]*-1
    });

    return communityOpinion;
}

HighChartsData.prototype.getPercentageByAttribute = function(attribute, resultSet) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var countsByAttribute = _.countBy(resultSet, attribute),
		totalSize = _.size(resultSet);
	if(!countsByAttribute.true || countsByAttribute.true === "NaN") {
		countsByAttribute.true = 0;
	}		
	var percentage = ((countsByAttribute.true)/totalSize*100).toFixed(2);
	
	return parseFloat(percentage);
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

HighChartsData.prototype.getPerfectIVPercentage = function(resultSet) {
	return this.getPercentageByAttribute('hasPerfectIV', resultSet);
};

HighChartsData.prototype.getEggMovePercentage = function(resultSet) {
	return this.getPercentageByAttribute('hasEggMove', resultSet);
};

HighChartsData.prototype.getQuickStats = function(resultSet) {	
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	return {
		resultCount: _.size(resultSet),
		totalCount: _.size(this.deserializedResults),
		resultPercent: (_.size(resultSet)/_.size(this.deserializedResults)*100).toFixed(2),  		
		shinyPercentage: this.getShinyPercentage(resultSet),
		hiddenAbilityPercentage: this.getHiddenAbilityPercentage(resultSet),
		itemPercentage: this.getItemPercentage(resultSet),
		pokerusPercentage: this.getPokerusPercentage(resultSet),
		eggMovePercentage: this.getEggMovePercentage(resultSet),
		perfectIvPercentage: this.getPerfectIVPercentage(resultSet)
	};
};

/**
 * Show percentages of hiddenAbilities, perfectIVs.. based on dates.
 */
HighChartsData.prototype.getQuickStatsTrendsByDates = function() {
	var startDate = new Date(2013, 10, 21),
		endDate = new Date(),
		shinyJSON = {
			name: "Shiny<br/> Pokemon",
			shortName: "Shiny Pokemon",
			data: []
		},
		hiddenAbilityJSON = {
			name: "Pokemon with a<br/> Hidden Ability",
			shortName: "Hidden Ability",
			data: []
		},
		pokerusJSON = {
			name: "Pokemon with <br/> Pokerus",
			shortName: "PokeRus",
			data: []
		},
		eggMoveJSON = {
			name: "Pokemon with<br/> Egg Moves",
			shortName: "Egg Moves",
			data: []
		},
		perfectIvJSON = {
			name: "Pokemon with at<br/> least one Perfect IV",
			shortName: "Perfect IV",
			data: []
		},
		highchartsTrendsChart;

	while(startDate < endDate) {
		var dateString = startDate.customFormatDate(),
			formattedDateResults = this.getResultsByDate(dateString),
			utcDateString = this.formatDateFromString(dateString),
			quickStatsByDate = this.getQuickStats(formattedDateResults);

		// Populate the Highcharts data
		if(quickStatsByDate.resultCount > this.dailyThreshold) {
			shinyJSON.data.push([utcDateString, quickStatsByDate.shinyPercentage]);
			hiddenAbilityJSON.data.push([utcDateString, quickStatsByDate.hiddenAbilityPercentage]);
			pokerusJSON.data.push([utcDateString, quickStatsByDate.pokerusPercentage]);
			eggMoveJSON.data.push([utcDateString, quickStatsByDate.eggMovePercentage]);
			perfectIvJSON.data.push([utcDateString, quickStatsByDate.perfectIvPercentage]);
		}

		startDate.setDate(startDate.getDate()+1);
	}

	highchartsTrendsChart = [shinyJSON, hiddenAbilityJSON, pokerusJSON, eggMoveJSON, perfectIvJSON];

	return highchartsTrendsChart;

};

HighChartsData.prototype.formatDateFromString = function(dateString){
	var formattedDate = dateString.split('-'),
		utcDate = Date.UTC(formattedDate[0], (parseInt(formattedDate[1])-1), formattedDate[2]);
	return utcDate;
};

exports.model = HighChartsData;