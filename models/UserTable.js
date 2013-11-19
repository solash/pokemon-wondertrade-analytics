var _ = require('underscore');

var UserTable = function(result) {
	var userHash = {};
	for(var user in result) {
		var currentUser = JSON.parse(result[user]);
		userHash[currentUser.id] = currentUser.username;
	}
	return userHash;
};

exports.model = UserTable;