exports.initController = function(app, dataStore) {
	var WondertradeModel = require('../models/wondertrade').model,
		HighChartsData = require('../models/HighChartsData').model;

	app.get('/', function(request, response){					
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){
			
			var highChartsData = new HighChartsData(result);

			response.render('home', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				user: request.user,
				stateMessage: '',
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate()),
				wondertradeCount: 70
			});
		});	
	});

	app.get('/about', function(request, response){	

		dataStore.lrange('userTable' , 0, -1, function(error, result){			

			var userTable = {};
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				userTable[parsedUser.id] = {username: parsedUser.username, count: 0};
			}

			dataStore.lrange('wondertrade' , 0, 100, function(error, result){
				var highChartsData = new HighChartsData(result),
					userTableWithCounts = highChartsData.getCountsByUserIdAndUserTable(false, userTable);
			
				response.render('about', {
					title: 'About this Project',
					pageState: '',
					user: request.user,
					userTable: userTableWithCounts
				});

			});

			
		});		
	});
};
