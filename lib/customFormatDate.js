/**
 * Helper Function that returns a date in a common string
 * @param date
 * @returns {string}
 */

module.exports = function (date) {
	var year = date.getFullYear(),
		month = ('0'+(date.getMonth()+1)).slice(-2),
		day = ('0'+(date.getDate())).slice(-2);

	return [year, month, day].join('-');
};