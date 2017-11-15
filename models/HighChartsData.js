var async = require('async'),
	customFormatDate = require('../lib/customFormatDate'),
	pokeballTypes = require('../data/pokeballTypes'),
	TOTAL_POKEMON_COUNT = 802;

function formatDateFromString(dateString){
	var formattedDate = dateString.split('-'),
		utcDate = Date.UTC(formattedDate[0], (parseInt(formattedDate[1])-1), formattedDate[2]);
	return utcDate;
}

/**
 * Build an empty pokemon-date-count object, presetting the chart to a 0'd values for each pokemon
 * @returns {
 *  pokemonId: {
 *      dateString: dateCount
 *  }
 * }
 */
function EmptyCountsByPokemonByDate () {

	var pokemonList = {},
		PokemonList,
		i;

	PokemonList = function() {
		var startDate = new Date(),
			endDate = new Date();

		startDate.setMonth(startDate.getMonth()-1);
		while(startDate <= endDate) {
			this[customFormatDate(startDate)] = 0;
			startDate.setDate(startDate.getDate()+1);
		}
		return this;
	};

	for (i = 0;i<=TOTAL_POKEMON_COUNT;i++) {
		pokemonList[i] = new PokemonList();
	}

	return pokemonList;
}

var HighChartsData = function(pokemonHash, countryHash) {

	this.deserializedResults = [];
	this.cachedData = {};
	this.dailyThreshold = 15;
	this.pokemonHash = pokemonHash;
	this.countryHash = countryHash;
};

HighChartsData.prototype.refreshData = function(jsonResults) {

	console.log('Refreshing HighCharts Data: ' + (new Date()));
	console.time('Finished Refreshing HighCharts Data');

	try {
		var jsonString = '[' + jsonResults + ']';
		jsonString = jsonString.replace('\'', '');

		this.deserializedResults = JSON.parse(jsonString);
		console.timeEnd('Finished Refreshing HighCharts Data');

		this.cachePageResults();
	} catch (e) {
		console.log(e);
		console.log('There was an error parsing the redis results. Falling back to the previous version.');

		var deserializedResults = [],
			self = this;

		async.each(jsonResults, function(currentWonderTrade) {

			try {
				deserializedResults.push(JSON.parse(currentWonderTrade));
			} catch (e) {
				console.log('There was a problem with WonderTrade: ', currentWonderTrade);
			}
		}, function(err){
			self.deserializedResults = deserializedResults;
			console.timeEnd('Finished Refreshing HighCharts Data');

			self.cachePageResults();
		});
	}
};

HighChartsData.prototype.cachePageResults = function () {
	var self = this;
	console.time('Highcharts Page Cache has been reset');
	this.getCountTrendsByPokemon(function(err, result) {
		self.formatCountTrendsByPokemon(result, function(err, formattedResult){
			self.cachedData.pokemonTrends = formattedResult;
		});
	});
	this.getTrendsByDate(null, function(err, result){
		self.cachedData.dateTrend = result;
	});
	this.getQuickStatsTrendsByDates(function(err, result){
		self.cachedData.dateTrendQuickstats = result;
	});
	this.getGenderData(function(err, result){
		self.cachedData.genderData = result;
	});
	console.timeEnd('Highcharts Page Cache has been reset');
};

HighChartsData.prototype.getSortedCountsByCountries = function(resultSet, callback){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var countryHash = this.countryHash,
		countryCountMap = {},
		country,
		countryCount;

	function createCountryCountMap(taskFinished) {
		async.each(resultSet, function(result, eachCallback){

			country = result.trainerCountry;
			countryCount = countryCountMap[country];
			countryCountMap[country] = (countryCount) ? (countryCount + 1) : 1;
			eachCallback();
		}, taskFinished);
	}

	function createCountryCountArray(taskFinished) {
		async.map(Object.keys(countryCountMap), function (countryId, countryCallback) {
			countryCallback(null, [countryHash[countryId], countryCountMap[countryId], countryId]);
		}, taskFinished);
	}

	function sortCountryCountArray(countryCountArray, taskFinished) {
		async.sortBy(countryCountArray, function(country, sortCallback){
			sortCallback(null, country[1]);
		}, taskFinished);
	}

	async.waterfall([
		createCountryCountMap,
		createCountryCountArray,
		sortCountryCountArray
	], function(err, result){
		callback(err, result);
	});
};

HighChartsData.prototype.getRandomSample = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	async.times(1000,
		function (n, whilstBack) {
			var index = ~~(Math.random() * resultSet.length);
			whilstBack(null, resultSet[index].pokemonId);
		},
		function (err, result) {
			callback(err, result);
		}
	);
};

HighChartsData.prototype.getSortedCountsByPokemon = function(resultSet, callback){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var pokemonHash = this.pokemonHash,
		pokemonCountMap = {},
		pokemonCount;

	function createPokemonCountsMap (taskFinished) {
		async.each(resultSet, function(wonderTrade, wonderTradeCallback) {
			pokemonCount = pokemonCountMap[wonderTrade.pokemonId];
			pokemonCountMap[wonderTrade.pokemonId] = pokemonCount ? pokemonCount + 1 : 1;
			wonderTradeCallback();
		}, taskFinished);
	}

	function createPokemonCountsArray (taskFinished) {
		async.map(Object.keys(pokemonCountMap), function (pokemonId, itemCallback) {
			itemCallback(null, [pokemonHash[pokemonId], pokemonCountMap[pokemonId], pokemonId]);
		}, taskFinished);
	}

	function sortPokemonCountArray(pokemonCountArray, taskFinished) {
		async.sortBy(pokemonCountArray, function(pokemon, sortCallback){
			sortCallback(null, pokemon[1]);
		}, taskFinished);
	}

	async.waterfall([
		createPokemonCountsMap,
		createPokemonCountsArray,
		sortPokemonCountArray
	], callback);
};

HighChartsData.prototype.getCountsByUserIdAndUserTableFormatted = function(resultSet, userTable, callback){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var userIdCountMap = {},
		userId,
		userIdCount;

	function createUserIdMap(taskFinished) {
		async.each(resultSet, function(wonderTrade, wonderTradeCallback){
			userId = wonderTrade.userId;
			userIdCount = userIdCountMap[userId];
			userIdCountMap[userId] = userIdCount ? userIdCount + 1 : 1;
			wonderTradeCallback();
		}, taskFinished);
	}

	function createUserIdArray(taskFinished) {
		async.map(Object.keys(userIdCountMap), function(userId, userIdCallback){
			userIdCallback(null, [ userTable[userId], userIdCountMap[userId], userId ]);
		}, taskFinished);
	}

	function sortUserIdArray(userIdArray, taskFinished) {
		async.sortBy(userIdArray, function(user, sortCallback){
			sortCallback(null, user[1] * -1);
		}, taskFinished);
	}

	async.waterfall([
		createUserIdMap,
		createUserIdArray,
		sortUserIdArray
	], callback);

};

HighChartsData.prototype.getResultsByPokemonId = function(pokemonId, callback) {

	pokemonId = parseInt(pokemonId, 10);
	if(pokemonId > 0 && pokemonId <= TOTAL_POKEMON_COUNT) {
		return async.filter(this.deserializedResults, function(wonderTrade, filterBack){
			filterBack(parseInt(wonderTrade.pokemonId, 10) === pokemonId);
		}, callback);
	}

	callback([]);
};

HighChartsData.prototype.getResultsWithHiddenAbilities = function(callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.hasHiddenAbility);
	}, callback);
};

HighChartsData.prototype.getResultsWithPerfectIV = function(callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.hasPerfectIV);
	}, callback);
};

HighChartsData.prototype.getResultsWithShinyPokemon = function(callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.isShiny);
	}, callback);
};

HighChartsData.prototype.getResultsByPokemonLevel = function(pokemonLevel, callback) {
	pokemonLevel = parseInt(pokemonLevel);
	if(pokemonLevel > 0 && pokemonLevel <= 100) {
		return async.filter(this.deserializedResults, function(wonderTrade, filterBack){
			filterBack(wonderTrade.level === pokemonLevel);
		}, callback);
	}
	callback([]);
};

HighChartsData.prototype.getResultsByRegionId = function(regionId, callback) {
	if(this.countryHash[regionId]) {
		return async.filter(this.deserializedResults, function(wonderTrade, filterBack){
			filterBack(wonderTrade.trainerCountry === regionId);
		}, callback);
	}
	callback([]);
};

HighChartsData.prototype.getResultsByUserId = function(userId, callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.userId === parseInt(userId));
	}, callback);
};

HighChartsData.prototype.getResultsByUserIdAndSubmissionDate = function(userId, submissionDate, callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.userId === parseInt(userId) && wonderTrade.date === submissionDate);
	}, callback);
};

HighChartsData.prototype.getResultsBySubmissionDate = function(submissionDate, callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.date === submissionDate);
	}, callback);
};

HighChartsData.prototype.getResultsByGender = function(gender, callback) {
	async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.trainerGender === gender);
	}, callback);
};

HighChartsData.prototype.getResultsByDateRange = function(startDate, endDate, callback){
	if (!endDate || endDate === 'now') {
		var tempDate = new Date();
		endDate = tempDate.getFullYear()+'-'+(tempDate.getMonth()+1)+'-'+tempDate.getDate();
	}
	async.filter(this.deserializedResults, function(wonderTrade, filterBack) {
		var resultDate =wonderTrade.date;
		filterBack(resultDate >= startDate && resultDate <= endDate);
	}, callback);
};

HighChartsData.prototype.getNicknamesByResultSet = function(resultSet, callback){
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	async.waterfall([
		function(taskComplete) {
			async.filter(resultSet, function(wonderTrade, filterBack) {
				filterBack(wonderTrade.pokemonNickname !== '');
			}, function(result) {taskComplete(null, result);});
		},
		function(nicknamedResults, taskComplete) {
			async.map(nicknamedResults, function(wonderTrade, cb){
				cb(null, wonderTrade.pokemonNickname);
			}, callback);
		}
	], callback);
};

HighChartsData.prototype.getCountsBySubRegions = function(regionSet, callback) {

	var regionCountMap = {},
		subregion,
		subregionCount;

	function createRegionCountMap(taskFinished){
		async.each(regionSet, function(wondertrade, wondertradeCallback){
			subregion = wondertrade.trainerCountrySub1;
			if (subregion) {
				subregionCount = regionCountMap[subregion];
				regionCountMap[subregion] = subregionCount ? subregionCount + 1 : 1;
			}
			wondertradeCallback();
		}, taskFinished);
	}

	function createRegionCountArray(taskFinished){
		async.map(Object.keys(regionCountMap), function(regionName, arrayCallback){
			arrayCallback(null, [regionName, regionCountMap[regionName]]);
		}, taskFinished);
	}

	function sortRegionCountArray(regionCounts, taskFinished) {
		async.sortBy(regionCounts, function(region, sortCallback){
			sortCallback(null, region[1]);
		}, taskFinished);
	}

	async.waterfall([
		createRegionCountMap,
		createRegionCountArray,
		sortRegionCountArray
	], callback);
};

HighChartsData.prototype.getCountsByGender = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var trainerGender = {
		male: 0,
		female: 0
	};
	async.each(resultSet, function(wonderTrade, wonderTradeCallback){
		trainerGender[wonderTrade.trainerGender]++;
		wonderTradeCallback();
	}, function(err){
		callback(err, [["Guys", trainerGender.male], ["Girls", trainerGender.female]]);
	});
};

HighChartsData.prototype.getCountsByLevels = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}
	var levelsChart = [],
		levelsChartFormatted = [{
			name: 'Levels',
			data: []
		}];

	for(var i=1, max=100;i<=max;i++) {
		levelsChart.push([i, 0]);
	}

	async.each(resultSet, function(wonderTrade, wonderTradeCallback){
		var currentLevel = parseInt(wonderTrade.level);

		if(currentLevel >= 1 && currentLevel <= 100) {
			levelsChart[currentLevel-1][1]++;
		}
		wonderTradeCallback();
	}, function(err){
		levelsChartFormatted[0].data = levelsChart;
		callback(err, levelsChartFormatted);
	});
};

/**
 * Retrieve the countTrend data for all pokemon.
 * @returns {1: [...], 2: []}, where 1/2 are pokemon ids, and the arrays are formatted highchart objects
 */
HighChartsData.prototype.getCountTrendsByPokemon = function(callback){

	var resultSet = this.deserializedResults;


	/**
	 * Before we were making multiple passes around the resultSet, it was very unoptimal.
	 *
	 * Our revision will do the following for each individual wonder trade.
	 *
	 * The proposed format will be:
	 *
	 *  pokemonId: {
	 *      dateString: count
	 *  }
	 *
	 * Example:
	 *
	 *  25: {
	 *      2015-01-15: 10
	 *      2015-01-14: 3
	 *  },
	 *  all: {
	 *      2015-01-15: 100
	 *      2015-01-14: 37
	 *  }
	 *
	 *  We start by filling the object with each pokemon and all dates for the past month.
	 *
	 **/

	var countsByDate = new EmptyCountsByPokemonByDate(),
		totalPokemon = countsByDate['0'],
		currentDate;

	async.each(resultSet, function(wonderTrade, resultCallback){
		var currentPokemon = countsByDate[wonderTrade.pokemonId];
		currentDate = wonderTrade.date;

		if ( typeof totalPokemon[currentDate] !== "undefined" &&
			typeof currentPokemon[currentDate] !== "undefined") {

			currentPokemon[currentDate]++;
			totalPokemon[currentDate]++;
		}
		resultCallback();
	}, function(){
		callback(null, countsByDate);
	});
};

HighChartsData.prototype.formatCountTrendsByPokemon = function(result, callback) {

	var keys = [],
		pokemonHash = this.pokemonHash,
		startDate = new Date(),
		endDate = new Date(),
		dateRange = [];

	startDate.setMonth(startDate.getMonth()-1);
	while(startDate < endDate) {
		dateRange.push(customFormatDate(startDate));
		startDate.setDate(startDate.getDate()+1);
	}

	// Fill the key list with pokemon ids
	for(var i =1; i<=TOTAL_POKEMON_COUNT;i++) {
		keys.push(i);
	}

	async.map(keys, function(pokemonId, formattedCountTrend) {

		var pokemonData = {
				name: pokemonHash[pokemonId],
				data: []
			},
			pokemon = result[pokemonId],
			currentDate,
			percentage;

		for(var i=0;i<dateRange.length;i++) {

			currentDate = dateRange[i];
			percentage = (parseFloat((pokemon[currentDate]/ (result['0'][currentDate]) *100).toFixed(2))) || 0;
			pokemonData.data.push([
				formatDateFromString(currentDate),
				percentage
			]);
		}

		formattedCountTrend(null, pokemonData);
	}, callback);
};

// Go back to the cache to retrieve the highchart data for an individual pokemon
HighChartsData.prototype.getCachedTrendByPokemonId = function(pokemonId, callback) {

	var self = this;

	function formattedCallback(callback) {
		var pokemonDataId = pokemonId ? (pokemonId - 1) : '',
			pokemon = self.cachedData.pokemonTrends[pokemonDataId] || {},
			data = (pokemon && pokemon.data) || [];

		callback(null, [{
			name: (self.pokemonHash[pokemonId] || ''),
			data: data
		}]);
	}

	if (!this.cachedData.pokemonTrends) {
		return callback('Still Loading');
	}

	formattedCallback(callback);
};

// Go back to the cache to retrieve the highchart data for a set of pokemon
HighChartsData.prototype.getCachedTrendByPokemonIds = function(pokemonIdArray, callback) {
	if (!this.cachedData.pokemonTrends) {
		return callback('Still Loading');
	}
	if (!(pokemonIdArray && pokemonIdArray.length)) {
		return callback('Empty Pokemon Trend List');
	}
	var self = this,
		pokemonData;
	async.map(pokemonIdArray, function(pokemonId, pokemonCallback){
		pokemonData = (self.cachedData &&
			self.cachedData.pokemonTrends &&
			self.cachedData.pokemonTrends[pokemonId - 1] &&
			self.cachedData.pokemonTrends[pokemonId - 1].data ) || [];
		pokemonCallback(null, {
			name: self.pokemonHash[pokemonId],
			data: pokemonData
		});
	}, callback);
};

HighChartsData.prototype.getSubmissionDates = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var dateStringMap = {},
		dateString,
		dateStringCount;

	function createSubmissionDatesMap(taskFinished) {
		async.each(resultSet, function(wondertrade, wondertradeCallback){
			dateString = wondertrade.date;
			dateStringCount = dateStringMap[dateString];
			dateStringMap[dateString] = dateStringCount ? dateStringCount + 1 : 1;
			wondertradeCallback();
		}, taskFinished);
	}
	function createSubmissionDatesArray(taskFinished) {
		async.map(Object.keys(dateStringMap), function(dateString, arrayCallback){
			arrayCallback(null, {
				dateString: dateString,
				formattedDate: formatDateFromString(dateString),
				count: dateStringMap[dateString]
			});
		}, taskFinished);
	}
	function sortSubmissionDatesArray(submissionArray, taskFinished) {
		async.sortBy(submissionArray, function(submission, sortCallback){
			sortCallback(null, submission.formattedDate);
		}, taskFinished);
	}

	async.waterfall([
		createSubmissionDatesMap,
		createSubmissionDatesArray,
		sortSubmissionDatesArray
	], callback);
};

HighChartsData.prototype.getTrendsByDate = function(resultSet, callback) {

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var startDate = new Date(2013, 10, 21),
		endDate = new Date(),
		fullDateRange = [],
		dateStringMap = {},
		dateString,
		dateStringCount;

	while(startDate < endDate) {
		fullDateRange.push([formatDateFromString(customFormatDate(startDate)), 0]);
		startDate.setDate(startDate.getDate()+1);
	}

	function createSubmissionDatesMap(taskFinished) {
		async.each(resultSet, function(wondertrade, wondertradeCallback){
			dateString = formatDateFromString(wondertrade.date);
			dateStringCount = dateStringMap[dateString];
			dateStringMap[dateString] = dateStringCount ? dateStringCount + 1 : 1;
			wondertradeCallback();
		},taskFinished);
	}
	function createDatesArray(taskFinished) {
		async.map(fullDateRange, function(dateStringObject, arrayCallback){
			dateStringObject[1] = dateStringMap[dateStringObject[0]] || 0;
			arrayCallback(null, dateStringObject);
		}, taskFinished);
	}

	function formatOutput(formattedDateValues, taskFinished) {
		taskFinished(null, {
			name: "Wonder Trades",
			data: formattedDateValues
		});
	}

	async.waterfall([
		createSubmissionDatesMap,
		createDatesArray,
		formatOutput
	], callback);
};

HighChartsData.prototype.getCachedTrendsByDate = function(callback) {
	if (this.cachedData.dateTrend) {
		return callback(null, this.cachedData.dateTrend);
	}
	callback('Still Loading');
};

HighChartsData.prototype.getTopPokemon = function(limit, callback){

	var startDate = new Date(),
		endDate = new Date(),
		self = this;

	startDate.setMonth(startDate.getMonth()-1);

	this.getResultsByDateRange(customFormatDate(startDate), customFormatDate(endDate), function(lastMonthsResults) {
		self.getSortedCountsByPokemon(lastMonthsResults, function(err, countTrends) {
			countTrends = countTrends.reverse();
			callback(null, countTrends.slice(0, limit));
		});
	});
};

HighChartsData.prototype.getCommunityLikes = function(resultSet, callback){

	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var pokemonHash = this.pokemonHash;

	var pokemonMap = {},
		pokemonIds = [],
		pokemon,
		pokemonId,
		opinionCount;

	for(var i=0;i<=TOTAL_POKEMON_COUNT;i++){
		pokemonIds.push(i);
	}

	function createPokemonLikesMap (taskFinished) {
		async.each(resultSet, function(wondertrade, wondertradeCallback){
			pokemonId = wondertrade.pokemonId;
			pokemon = pokemonMap[pokemonId - 1];
			if (!pokemon) {
				pokemonMap[pokemonId - 1] = {
					id: pokemonId,
					name: pokemonHash[pokemonId],
					percentage: 0,
					count: 0,
					likes: 0,
					dislikes: 0
				};
				pokemon = pokemonMap[pokemonId - 1];
			}
			if(wondertrade.liked === "like"){
				pokemon.likes++;
			} else if(wondertrade.liked === "dislike") {
				pokemon.dislikes++;
			}
			pokemon.count++;
			opinionCount = pokemon.likes + pokemon.dislikes;
			pokemon.percentage = (pokemon.likes / (opinionCount)*100).toFixed(2);

			wondertradeCallback();
		}, taskFinished);
	}

	function createPokemonLikesArray (taskFinished) {
		async.map(pokemonIds, function(pokemonId, pokemonIdCallback){
			if (pokemonMap[pokemonId]) {
				return pokemonIdCallback(null, pokemonMap[pokemonId]);
			}
			pokemonIdCallback(null, {
				id: pokemonId,
				name: pokemonHash[pokemonId],
				percentage: 0,
				count: 0,
				likes: 0,
				dislikes: 0
			});
		}, taskFinished);
	}

	function sortPokemonLikesArray (pokemonMapArray, taskFinished) {
		async.sortBy(pokemonMapArray, function(pokemon, sortCallback) {
			sortCallback(null, parseInt(pokemon.likes - pokemon.dislikes) * -1);
		}, taskFinished);
	}

	function filterPokemonLikesArray(pokemonLikesArray, taskFinish) {
		async.filter(pokemonLikesArray, function(pokemon, filterCallback){
			filterCallback(( pokemon.count > 2 && (pokemon.percentage > 80 || pokemon.percentage < 20 ) ));
		}, function(result) {
			taskFinish(null, result);
		});
	}

	function formatOutput(sortedPokemonMap, taskFinished){
		var size = sortedPokemonMap.length,
			dislikes = sortedPokemonMap.slice(size - 20, size);
		dislikes = dislikes.reverse();
		taskFinished(null, {
			likes: sortedPokemonMap.slice(0, 20),
			dislikes: dislikes
		});
	}

	async.waterfall([
		createPokemonLikesMap,
		createPokemonLikesArray,
		filterPokemonLikesArray,
		sortPokemonLikesArray,
		formatOutput
	], callback);
};

HighChartsData.prototype.getPercentageByAttribute = function(attribute, resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	async.filter(resultSet, function(wondertrade, wondertradeCallback){
		wondertradeCallback(wondertrade[attribute]);
	}, function(result){
		var subsetSize = result.length || 0,
			totalSize = resultSet.length,
			percentage = ((subsetSize)/totalSize*100).toFixed(2);
		callback(null, parseFloat(percentage));
	});
};

HighChartsData.prototype.getShinyPercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('isShiny', resultSet, callback);
};

HighChartsData.prototype.getItemPercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('hasItem', resultSet, callback);
};

HighChartsData.prototype.getPokerusPercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('hasPokerus', resultSet, callback);
};

HighChartsData.prototype.getHiddenAbilityPercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('hasHiddenAbility', resultSet, callback);
};

HighChartsData.prototype.getPerfectIVPercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('hasPerfectIV', resultSet, callback);
};

HighChartsData.prototype.getEggMovePercentage = function(resultSet, callback) {
	this.getPercentageByAttribute('hasEggMove', resultSet, callback);
};

HighChartsData.prototype.getLikePercentage = function(resultSet, callback){
	var likes = 0,
		dislikes = 0;

	async.each(resultSet, function(wondertrade, wondertradeCallback) {
		var liked = wondertrade.liked;
		if (liked === 'like') {
			likes++;
		} else if(liked === 'dislike') {
			dislikes++;
		}
		wondertradeCallback();
	}, function(){
		var total = likes+dislikes;
		if(total > 0) {
			var percentage = (likes/(total)*100).toFixed(2);
			return callback(null, parseFloat(percentage));
		}
		callback(null, " ");
	});
};

HighChartsData.prototype.getQuickStats = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var self = this;
	async.parallel({
		shinyPercentage: this.getShinyPercentage.bind(this, resultSet),
		hiddenAbilityPercentage: this.getHiddenAbilityPercentage.bind(this, resultSet),
		itemPercentage: this.getItemPercentage.bind(this, resultSet),
		pokerusPercentage: this.getPokerusPercentage.bind(this, resultSet),
		eggMovePercentage: this.getEggMovePercentage.bind(this, resultSet),
		perfectIvPercentage: this.getPerfectIVPercentage.bind(this, resultSet),
		likePercentage: this.getLikePercentage.bind(this, resultSet)

	}, function(err, results){
		var resultCount = resultSet.length,
			totalCount = self.deserializedResults.length;

		callback(err, {
			resultCount: resultCount,
			totalCount: totalCount,
			resultPercent: (resultCount/totalCount * 100 ).toFixed(2) || 0,
			shinyPercentage: results.shinyPercentage,
			hiddenAbilityPercentage: results.hiddenAbilityPercentage,
			itemPercentage: results.itemPercentage,
			pokerusPercentage: results.pokerusPercentage,
			eggMovePercentage: results.eggMovePercentage,
			perfectIvPercentage: results.perfectIvPercentage,
			likePercentage: results.likePercentage
		});
	});


};

HighChartsData.prototype.filterGroupsOfPokemon = function(pokemonGroupArray, callback) {
	if (!(pokemonGroupArray && pokemonGroupArray.length)) {
		return callback('Empty Pokemon Group');
	}
	async.filter(this.deserializedResults, function(wondertrade, wondertradeCallback){
		wondertradeCallback(pokemonGroupArray.indexOf(wondertrade.pokemonId) !== -1);
	}, callback);
};

/**
 * Show percentages of hiddenAbilities, perfectIVs.. based on dates.
 */
HighChartsData.prototype.getQuickStatsTrendsByDates = function(callback) {
	var startDate = new Date(),
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
		self = this;

	startDate.setMonth(startDate.getMonth()-12);

	async.whilst(
		function () {
			return (startDate < endDate);
		},
		function (dateCallback) {

			var dateString = customFormatDate(startDate),
				utcDateString = formatDateFromString(dateString);

			self.getResultsBySubmissionDate(dateString, function(formattedDateResults){
				self.getQuickStats(formattedDateResults, function(err, quickStatsByDate) {

					// Populate the Highcharts data
					if(quickStatsByDate.resultCount > self.dailyThreshold) {
						shinyJSON.data.push([utcDateString, quickStatsByDate.shinyPercentage]);
						hiddenAbilityJSON.data.push([utcDateString, quickStatsByDate.hiddenAbilityPercentage]);
						pokerusJSON.data.push([utcDateString, quickStatsByDate.pokerusPercentage]);
						eggMoveJSON.data.push([utcDateString, quickStatsByDate.eggMovePercentage]);
						perfectIvJSON.data.push([utcDateString, quickStatsByDate.perfectIvPercentage]);
					}

					startDate.setDate(startDate.getDate()+1);

					setTimeout( function() {
						dateCallback();
					}, 0 );
				});
			});
		},
		function (err) {
			callback(err, [shinyJSON, hiddenAbilityJSON, pokerusJSON, eggMoveJSON, perfectIvJSON]);
		}
	);
};

HighChartsData.prototype.getCachedQuickStatsTrendsByDates = function(callback) {
	if (this.cachedData.dateTrendQuickstats) {
		return callback(null, this.cachedData.dateTrendQuickstats);
	}
	callback(null, []);
};

HighChartsData.prototype.getDataSplitByTime = function(resultSet, callback) {
	if(!resultSet) {
		resultSet = this.deserializedResults;
	}

	var timeGroupMap = {},
		timeString;

	async.each(resultSet, function(wondertrade, wondertradeCallback){
		if(wondertrade.time) {
			timeString = Math.floor(parseInt(wondertrade.time)/3600);
			if (timeGroupMap[timeString] && timeGroupMap[timeString].length) {
				timeGroupMap[timeString].push(wondertrade);
			} else {
				timeGroupMap[timeString] = [wondertrade];
			}
		}
		wondertradeCallback();
	}, function(err){
		callback(err, timeGroupMap);
	});
};

HighChartsData.prototype.getDataCountsSplitByTime = function(resultSet, callback) {

	var self = this,
		hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

	// TODO: clean up
	this.getDataSplitByTime(resultSet, function(err, getFilteredDataByTime){
		self.getDataSplitByTime(null, function(err, getFullDataByTime){
			var filtered = 0,
				full = 1;
			async.map(hours, function(hour, hourBack){
				filtered = (getFilteredDataByTime[hour] && getFilteredDataByTime[hour].length) || 0;
				full = (getFullDataByTime[hour] && getFullDataByTime[hour].length) || filtered;
				hourBack(null, (filtered / full));
			}, function(err, result){
				callback(err, {
					name: "Time Trends",
					data: result
				});
			});
		});
	});
};

HighChartsData.prototype.getQuickStatsTrendsByTime = function(timeGrouping, callback) {

	var shinyJSON = {
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
		hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
		self = this;

	async.eachSeries(hours,
		function(hour, hourCallback) {
			self.getQuickStats(timeGrouping[hour], function(err, quickStatsByDate){
				// Populate the Highcharts data
				if(quickStatsByDate.resultCount > self.dailyThreshold) {
					shinyJSON.data.push([hour, quickStatsByDate.shinyPercentage]);
					hiddenAbilityJSON.data.push([hour, quickStatsByDate.hiddenAbilityPercentage]);
					pokerusJSON.data.push([hour, quickStatsByDate.pokerusPercentage]);
					eggMoveJSON.data.push([hour, quickStatsByDate.eggMovePercentage]);
					perfectIvJSON.data.push([hour, quickStatsByDate.perfectIvPercentage]);
				}
				hourCallback();
			});
		},
	function(){
		callback(null, [
			shinyJSON,
			hiddenAbilityJSON,
			pokerusJSON,
			eggMoveJSON,
			perfectIvJSON
		]);
	});

};

HighChartsData.prototype.getGenderData = function(callback) {

	var maleSubset,
		femaleSubset,
		self = this;

	async.series([
		function(taskCallback){
			self.getResultsByGender('male', function(result){
				maleSubset = result;
				taskCallback(null);
			});
		},
		function(taskCallback){
			self.getQuickStats(maleSubset, taskCallback);
		},
		function(taskCallback){
			self.getSortedCountsByPokemon(maleSubset, taskCallback);
		},
		function(taskCallback){
			self.getSortedCountsByCountries(maleSubset, taskCallback);
		},
		function(taskCallback){
			self.getResultsByGender('female', function(result){
				femaleSubset = result;
				taskCallback(null);
			});
		},
		function(taskCallback){
			self.getQuickStats(femaleSubset, taskCallback);
		},
		function(taskCallback){
			self.getSortedCountsByPokemon(femaleSubset, taskCallback);
		},
		function(taskCallback){
			self.getSortedCountsByCountries(femaleSubset, taskCallback);
		}
	], function(err, results){

		var malePokemonChart = results[2],
			malePokemonLength = malePokemonChart.length,
			maleTopTen = malePokemonChart.slice((malePokemonLength - 10), malePokemonLength),
			femalePokemonChart = results[6],
			femalePokemonLength = femalePokemonChart.length,
			femaleTopTen = femalePokemonChart.slice((femalePokemonLength  - 10), femalePokemonLength );

		maleTopTen = maleTopTen.reverse();
		femaleTopTen = femaleTopTen.reverse();

		callback(err, {
			maleQuickstats: results[1],
			malePokemonChart: malePokemonChart,
			maleCountryChart: results[3],
			femaleQuickstats: results[5],
			femalePokemonChart: femalePokemonChart,
			femaleCountryChart: results[7],
			maleTopTenPokemon: maleTopTen,
			femaleTopTenPokemon: femaleTopTen
		});
	});

};

HighChartsData.prototype.getCachedGenderData = function(callback) {
	if (this.cachedData.genderData) {
		return callback(null, this.cachedData.genderData);
	}
	callback('Still Loading');
};

HighChartsData.prototype.getPokeballsData = function(callback) {
	async.reduce(this.deserializedResults, {}, function(memo, wonderTrade, filterBack) {
		if (wonderTrade.pokeballType) {
			memo[wonderTrade.pokeballType] = memo[wonderTrade.pokeballType] ? memo[wonderTrade.pokeballType] + 1 : 1;
		}
		setImmediate(function() {
			filterBack(null, memo);
		});
	}, callback);
};

HighChartsData.prototype.getResultsByPokeballType = function(type, callback) {
	if (pokeballTypes.indexOf(type) === -1) {
		return callback([]);
	}

	return async.filter(this.deserializedResults, function(wonderTrade, filterBack){
		filterBack(wonderTrade.pokeballType === type);
	}, callback);
};

module.exports = HighChartsData;