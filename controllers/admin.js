var UserTableModel = require('../models/UserTable').model,
	HighChartsData = require('../models/HighChartsData').model,
	PokemonList = require('../data/pokemonList.json'),
	CountryList = require('../data/countryList.json'),
	PokemonHash = {},
	CountryHash = {};

	for(var pokemon in PokemonList) {
		PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
	}

	for(var country in CountryList) {
		CountryHash[CountryList[country].id] = CountryList[country].name;
	};

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

	app.get('/fullLogs', function(request, response){
		var currentUser = request.user;
		if(currentUser &&
			(currentUser.username == "TheIronDeveloper" || currentUser.username == "JoJo") ) {
			

			dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result);

				dataStore.lrange('wondertrade' , 0, -1, function(error, result){
					var highChartsData = new HighChartsData(result);

					response.render('wondertrade/index', {
						wondertrades: highChartsData.deserializedResults,
						title: 'Wonder Trade Full List',
						pokemonHash: PokemonHash,
						countryHash: CountryHash,
						pageState: '',
						userTable: userTable,
						user: request.user
					});
				});
			});

			
		} else {
			response.send('Forbidden.');
		}		
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

                dataStore.lrange('redditUser' , 0, -1, function(error, result){
                    for(var user in result) {
                        tempUser = JSON.parse(result[user]);
                        if(tempUser.userId == userId) {
                            dataStore.lrem('redditUser', 0, result[user]);
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