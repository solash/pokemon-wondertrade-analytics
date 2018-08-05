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
				pokemon: [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728]
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
			'omega-exclusives': {
				name: 'OR Exclusives',
				pokemon: [140, 141, 250, 273, 274, 275, 303, 335, 338, 383, 410, 411, 422, 423, 484, 538, 566, 567, 641, 643, 690, 691]
			},
			'alpha-exclusives': {
				name: 'AS Exclusives',
				pokemon: [138 ,139, 249, 270, 271, 272, 302, 336, 337, 382, 408, 409, 422, 423, 483, 539, 564, 565, 642, 644, 692, 693]
			},
			'fossils': {
				name: 'Fossil Pokemon',
				pokemon: [138, 139, 140, 141, 142, 345, 346, 347, 348, 408, 409, 410, 411, 564, 565, 566, 567, 696, 697, 698, 699]
			},
			'pokebanks': {
				name: 'PokeBank Only',
				pokemon: [19,20,52,53,109,110,137,151,152,153,154,155,156,157,158,159,160,200,201,233,234,243,244,245,249,250,251,252,253,254,258,259,260,287,288,289,343,344,349,350,351,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,401,402,420,421,427,428,429,431,432,456,457,474,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,546,547,554,555,562,563,592,593,602,603,604,605,606,626,638,639,640,641,642,643,644,645,646,647,648,649]
			},
			'gen1': {
				name: 'Generation I',
				pokemon: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151]
			},
			'gen2': {
				name: 'Generation II',
				pokemon: [152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251]
			},
			'gen3': {
				name: 'Generation III',
				pokemon: [252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386]
			},
			'gen4': {
				name: 'Generation IV',
				pokemon: [387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493]
			},
			'gen5': {
				name: 'Generation V',
				pokemon: [494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649]
			},
			'gen6': {
				name: 'Generation VI',
				pokemon: [650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721]
			},
			'gen7': {
				name: 'Generation VII',
				pokemon: [722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807]
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