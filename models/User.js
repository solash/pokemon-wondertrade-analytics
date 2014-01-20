module.exports = function(params) {
	var userModel = {
		"username" : params.username,
		"password": params.password,
		"id": params.id
	};

	if(!userModel.username) {
		return false;
	} else {
		return userModel;
	}
};