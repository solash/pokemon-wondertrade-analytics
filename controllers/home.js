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
				wondertradeCount: result.length
			});
		});	
	});

	app.get('/about', function(request, response){	

		dataStore.lrange('userTable' , 0, -1, function(error, result){			

			var userTable = {};
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				userTable[parsedUser.id] = {username: parsedUser.username, count: 0, id: parsedUser.id};
			}

			dataStore.lrange('wondertrade' , 0, -1, function(error, result){
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

	app.get('/contributers', function(request, response){	

		dataStore.lrange('userTable' , 0, -1, function(error, result){			

			var userTable = {};
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				userTable[parsedUser.id] = {username: parsedUser.username, count: 0, id: parsedUser.id};
			}

			dataStore.lrange('wondertrade' , 0, -1, function(error, result){
				var highChartsData = new HighChartsData(result),
					userTableWithCounts = highChartsData.getCountsByUserIdAndUserTable(false, userTable);
			
				response.render('contributers', {
					title: 'Project Contributers',
					pageState: '',
					user: request.user,
					trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByUsers(false, userTable)),
					userTable: userTableWithCounts
				});

			});

			
		});		
	});

	app.get('/help', function(request, response){		
		response.render('help', {
			title: 'Wonder Trade Contributers',
			pageState: '',			
			user: request.user
		});
	});

	app.get('/faq', function(request, response){		
		response.render('faq', {
			title: 'Frequently Asked Questions',
			pageState: '',			
			user: request.user
		});
	});
};
