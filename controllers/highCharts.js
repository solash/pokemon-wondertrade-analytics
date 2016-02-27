/**
 * This controller handles returning high chart data asynchronously
 */

var responses = require('../middleware/responses'),
	parsedWTCounts = require('../models/parsedWonderTradeCounts'),
	achievements = require('../models/Achievements');

function setSubsetByHiddenAbilities(req, res, next) {
	req.highChartsData.getResultsWithHiddenAbilities(function(result){
		req.currentSubset = result;
		next();
	});
}
function setSubsetByPerfectIV(req, res, next) {
	req.highChartsData.getResultsWithPerfectIV(function(result){
		req.currentSubset = result;
		next();
	});
}
function setSubsetByShinyPokemon(req, res, next) {
	req.highChartsData.getResultsWithShinyPokemon(function(result){
		req.currentSubset = result;
		next();
	});
}

function setSubsetByPokemonId (req, res, next) {
	var pokemonId = req.params.pokemonId;
	req.highChartsData.getResultsByPokemonId(pokemonId, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByPokemonLevel (req, res, next) {
	var pokemonLevel = req.params.pokemonLevel;
	req.highChartsData.getResultsByPokemonLevel(pokemonLevel, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByRegionId (req, res, next) {
	var regionId = req.params.regionCode;
	req.highChartsData.getResultsByRegionId(regionId, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByUserId (req, res, next) {
	var userId = req.params.userId;
	req.highChartsData.getResultsByUserId(userId, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByUserIdAndSubmissionDate (req, res, next) {
	var userId = req.params.userId,
		submissionDate = req.params.submissionDate;

	req.highChartsData.getResultsByUserIdAndSubmissionDate(userId, submissionDate, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetBySubmissionDate (req, res, next) {
	var submissionDate = req.params.submissionDate;
	req.highChartsData.getResultsBySubmissionDate(submissionDate, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByDateRange (req, res, next) {
	var startDate = req.params.startDate,
		endDate = req.params.endDate || 'now';
	req.highChartsData.getResultsByDateRange(startDate, endDate, function(result) {
		req.currentSubset = result;
		next();
	});
}
function setSubsetByPokeballType(req, res, next) {
	var type = req.params.type;
	req.highChartsData.getResultsByPokeballType(type, function(result){
		req.currentSubset = result;
		next();
	});
}
function setPokemonGroup (req, res, next) {

	var groupName = req.params.groupName || '',
		groupMap = {
			'eeveelutions': {
				name: 'Eeveelutions',
				pokemon: [134, 135, 136, 196, 197, 470, 471, 700]
			},
			'starters': {
				name: 'Starters',
				pokemon: [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656]
			},
			'trade-evos': {
				name: 'Trade Evolutions',
				pokemon: [64, 67, 75, 93, 525, 533, 708, 711]
			},
			'trio-legendarys': {
				name: 'Trio Legendarys',
				pokemon: [144, 145, 146, 243, 244, 245, 377, 378, 379, 480, 481, 482, 638, 639, 640]
			},
			'version-exclusives': {
				name: 'Version Exclusives',
				pokemon: [120, 121, 127, 228, 229, 261, 262, 304, 305,306,345,346,347,348,539,684,685,692,693,716,90,91,138,139,140,141,214,246,247,248,309,310,509,510,538,682,683,690,691,717]
			},
			'pokebanks': {
				name: 'PokeBank Only',
				pokemon: [19,20,52,53,109,110,137,151,152,153,154,155,156,157,158,159,160,200,201,233,234,243,244,245,249,250,251,252,253,254,258,259,260,287,288,289,343,344,349,350,351,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,401,402,420,421,427,428,429,431,432,456,457,474,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,546,547,554,555,562,563,592,593,602,603,604,605,606,626,638,639,640,641,642,643,644,645,646,647,648,649]
			}
		},
		pokemonGroup = groupMap[groupName];

	if (pokemonGroup) {
		req.data.pokemonGroupName = pokemonGroup.name || '';
		req.data.pokemonGroup = pokemonGroup.pokemon || [];
		return next();
	}

	req.data.pokemonGroup = req.data.topPokemon;
	next();
}

function setSubsetByPokemonGroup(req, res, next) {
	req.highChartsData.filterGroupsOfPokemon(req.data.pokemonGroup, function(result){
		req.currentSubset = result;
		next();
	});
}

function getSortedCountsByCountries(req, resp, next) {
	req.highChartsData.getSortedCountsByCountries(req.currentSubset, function(err, result) {
		req.data.sortedCountsByCountries = result;
		next();
	});
}
function getSortedCountsByPokemon(req, res, next) {
	req.highChartsData.getSortedCountsByPokemon(req.currentSubset, function(err, result) {
		req.data.sortedCountsByPokemon = result;
		next();
	});
}
function getCountsByLevels (req, res, next) {
	req.highChartsData.getCountsByLevels(req.currentSubset, function(err, result) {
		req.data.countsByLevels = result;
		next();
	});
}
function getQuickStats (req, res, next) {
	req.highChartsData.getQuickStats (req.currentSubset, function(err, result) {
		req.data.quickstats = result;
		next();
	});
}
function getTopPokemon (req, res, next) {
	req.highChartsData.getTopPokemon (5, function(err, result) {
		req.data.topPokemon = result.map(function(pkmn){
			return parseInt(pkmn[2], 10);
		});
		next();
	});
}
function getNicknamesByResultSet (req, res, next) {
	req.highChartsData.getNicknamesByResultSet (req.currentSubset, function(err, result) {
		req.data.nicknames = result;
		next();
	});
}
function getCountsByGender (req, res, next) {
	req.highChartsData.getCountsByGender (req.currentSubset, function(err, result) {
		req.data.countsByGender = result;
		next();
	});
}

function getCachedTrendByPokemonId (req, res, next) {
	req.highChartsData.getCachedTrendByPokemonId (req.params.pokemonId, function(err, result) {
		if (err) {
			return responses.renderError(req, res);
		}
		req.data.cachedTrendByPokemonId = result;
		next();
	});
}
function getCachedTrendByPokemonIds (req, res, next) {
	req.highChartsData.getCachedTrendByPokemonIds (req.data.pokemonGroup, function(err, result) {
		if (err) {
			return responses.renderError(req, res);
		}
		req.data.cachedTrendByPokemonIds = result;
		next();
	});
}

function getCachedTrendsByDate (req, res, next) {
	req.highChartsData.getCachedTrendsByDate (function(err, result) {
		if (err) {
			return responses.renderError(req, res);
		}
		req.data.cachedTrendsByDate = result;
		next();
	});
}

function getDataCountsSplitByTime(req, res, next) {
	req.highChartsData.getDataCountsSplitByTime(req.currentSubset, function(err, result) {
		req.data.dataCountsSplitByTime = result;
		next();
	});
}

function getCountsBySubRegions(req, res, next) {
	req.highChartsData.getCountsBySubRegions(req.currentSubset, function(err, result) {
		req.data.countsBySubRegions = result;
		next();
	});
}

function getCachedQuickStatsTrendsByDates(req, res, next) {
	req.highChartsData.getCachedQuickStatsTrendsByDates(function(err, result) {
		if (err) {
			return responses.renderError(req, res);
		}
		req.data.cachedQuickStatsTrendsByDates = result;
		next();
	});
}

function getTrendsByDate(req, res, next) {
	req.highChartsData.getTrendsByDate(req.currentSubset, function(err, result) {
		req.data.trendsByDate = result;
		next();
	});
}

function getCountsByUserIdAndUserTableFormatted(req, res, next) {
	req.highChartsData.getCountsByUserIdAndUserTableFormatted(req.currentSubset, req.userTable, function(err, result) {
		req.data.countsByUserIdAndUserTableFormatted = result;
		next();
	});
}

function getDataSplitByTime(req, res, next) {
	req.highChartsData.getDataSplitByTime(req.currentSubset, function(err, result) {
		req.data.dataSplitByTime = result;
		next();
	});
}

function getQuickStatsTrendsByTime(req, res, next){
	req.highChartsData.getQuickStatsTrendsByTime(req.data.dataSplitByTime, function(err, result) {
		req.data.quickStatsTrendsByTime = result;
		next();
	});
}

function getCommunityLikes(req, res, next) {
	req.highChartsData.getCommunityLikes(req.currentSubset, function(err, result) {
		req.data.communityLikes = result;
		next();
	});
}

function getSubmissionDates(req, res, next) {
	req.highChartsData.getSubmissionDates(req.currentSubset, function(err, result) {
		req.data.submissionDates = result;
		next();
	});
}

function getRandomSample(req, res, next){
	req.highChartsData.getRandomSample(req.currentSubset, function(err, result) {
		req.data.randomSample = result;
		next();
	});
}

function getGenderData(req, res, next){
	req.highChartsData.getCachedGenderData(function(err, result) {
		if (err) {
			return responses.renderError(req, res);
		}
		req.data.genderData = result;
		next();
	});
}

/**
 * Transform the current subset into a parsedCountMap, then return an achievements map
 */
function getAchievements(req, res) {
	parsedWTCounts(req.currentSubset, function(err, results) {
		achievements(results, function(err, results){
			req.data = results;
			responses.renderJSON(req, res);
		});
	});
}

// es6 format
module.exports = {
	setSubsetByHiddenAbilities: setSubsetByHiddenAbilities,
	setSubsetByPerfectIV: setSubsetByPerfectIV,
	setSubsetByShinyPokemon: setSubsetByShinyPokemon,
	setSubsetByPokemonGroup: setSubsetByPokemonGroup,

	setSubsetByPokemonId: setSubsetByPokemonId,
	setSubsetByPokemonLevel: setSubsetByPokemonLevel,
	setSubsetByRegionId: setSubsetByRegionId,
	setSubsetByUserId: setSubsetByUserId,
	setSubsetByUserIdAndSubmissionDate: setSubsetByUserIdAndSubmissionDate,
	setSubsetBySubmissionDate: setSubsetBySubmissionDate,
	setSubsetByDateRange: setSubsetByDateRange,
	setSubsetByPokeballType: setSubsetByPokeballType,

	setPokemonGroup: setPokemonGroup,

	getSortedCountsByCountries: getSortedCountsByCountries,
	getSortedCountsByPokemon: getSortedCountsByPokemon,
	getCountsByLevels: getCountsByLevels,
	getQuickStats: getQuickStats,
	getTopPokemon: getTopPokemon,
	getNicknamesByResultSet: getNicknamesByResultSet,
	getCountsByGender: getCountsByGender,
	getCachedTrendByPokemonId: getCachedTrendByPokemonId,
	getCachedTrendByPokemonIds: getCachedTrendByPokemonIds,
	getCachedTrendsByDate: getCachedTrendsByDate,
	getDataCountsSplitByTime: getDataCountsSplitByTime,
	getCountsBySubRegions: getCountsBySubRegions,
	getCachedQuickStatsTrendsByDates: getCachedQuickStatsTrendsByDates,
	getTrendsByDate: getTrendsByDate,
	getDataSplitByTime: getDataSplitByTime,
	getQuickStatsTrendsByTime: getQuickStatsTrendsByTime,
	getCommunityLikes: getCommunityLikes,
	getSubmissionDates: getSubmissionDates,
	getRandomSample: getRandomSample,
	getGenderData: getGenderData,
	getAchievements: getAchievements,
	getCountsByUserIdAndUserTableFormatted: getCountsByUserIdAndUserTableFormatted
};