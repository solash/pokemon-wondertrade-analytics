
var schema = require('../schema/achievements');

/**
 * Transform the ParsedWonderTradeCounts into a map of achievements
 * @param parsedCounts - ParsedWonderTradeCounts
 * @param callback {err|result} - Return achievement map
 */
module.exports = function(parsedCounts, callback) {
	var achievements = Object.keys(schema),
		result = achievements.reduce(function(memo, achievementName){
			memo[achievementName] = schema[achievementName].condition(parsedCounts) || false;
			return memo;
		}, {});

	callback(null, result);
};