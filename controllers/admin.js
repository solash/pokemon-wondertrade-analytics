exports.initController = function(app, dataStore) {
	// Admin Related Stuff.
	app.get('/operationCleanSlate', function(request, response){
		var currentUser = request.user;
		if(currentUser && currentUser.username == "TheIronDeveloper") {
			dataStore.del('userTable');		
			dataStore.del('wondertrade');
			response.send('Operation Clean Slate');
		}		
	});

	app.get('/operationCleanSlate2', function(request, response){
		
			dataStore.del('userTable');		
			dataStore.del('wondertrade');
			response.send('Operation Clean Slate');
		
	});
	
	app.get('/purge/users/:userId', function(request, response){
		//dataStore.del('wondertrade');		
		var userId = request.params.userId,
			currentUser = request.user,
			tempUser,
			deleteUser;

		// Cheap, I know... I need to implement an admin/mod/user system at some point.		
		if(currentUser && currentUser.username == "TheIronDeveloper") {
			console.log('Removing User ID: '+userId);
			dataStore.lrange('userTable' , 0, -1, function(error, result){
				for(var user in result) {
					tempUser = JSON.parse(result[user]);
					if(tempUser.id == userId) {					
						dataStore.lrem('userTable', 0, result[user]);
						console.log('Removed: ');
						console.log(result[user]);
					}
				}

				dataStore.lrange('wondertrade' , 0, -1, function(error, result){
					for(var wondertrade in result) {
						tempWondertrade = JSON.parse(result[wondertrade]);
						if(tempWondertrade.userId == userId) {											
							dataStore.lrem('wondertrade', 0, result[wondertrade]);				
							console.log('Removed: ');
							console.log(result[wondertrade]);
						}
					}
				});
				
				response.send('Alright, '+userId+' has officially been removed!');
				
			});	
		} else {
			response.send('Forbidden.');
		}
	});
}