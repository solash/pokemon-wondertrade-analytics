exports.model = function(params) {
	var userModel = {
		"username" : params.username
	};

	if(!userModel.username) {
		return false;
	} else {
		return userModel;
	}
};