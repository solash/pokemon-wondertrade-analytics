exports.initController = function(app, dataStore) {
	var WondertradeModel = require('../models/wondertrade').model,
		HighChartsData = require('../models/HighChartsData').model,
		_ = require('underscore');

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

        dataStore.lrange('redditUser' , 0, -1, function(error, result){
            var redditUsers = {};
            for(var user in result) {
                var parsedUser = JSON.parse(result[user]);
                redditUsers[parsedUser.userId] = {redditUserName: parsedUser.redditUserName};
            }

            dataStore.lrange('userTable' , 0, -1, function(error, result){

                var userTable = {};
                for(var user in result) {
                    var parsedUser = JSON.parse(result[user]);
                    userTable[parsedUser.id] = {username: parsedUser.username, count: 0, id: parsedUser.id};
                }

                dataStore.lrange('wondertrade' , 0, -1, function(error, result){
                    var highChartsData = new HighChartsData(result),
                        userTableWithCounts = highChartsData.getCountsByUserIdAndUserTable(false, userTable),
                        trendingPokemonChart = highChartsData.getCountTrendsByUsers(false, userTable);


                    trendingPokemonChart = _.sortBy(trendingPokemonChart, 'fullCount');
                    trendingPokemonChart.reverse();
                    trendingPokemonChart = _.first(trendingPokemonChart, 10);

                    response.render('contributers', {
                        title: 'Project Contributers',
                        pageState: '',
                        user: request.user,
                        trendingPokemonChart: JSON.stringify(trendingPokemonChart),
                        userTable: userTableWithCounts,
                        redditUsers: redditUsers
                    });

                });

            });

        });
	});

    app.get('/contest', function(request, response){

        dataStore.lrange('userTable' , 0, -1, function(error, result){

            var userTable = {};
            for(var user in result) {
                var parsedUser = JSON.parse(result[user]);
                userTable[parsedUser.id] = {username: parsedUser.username, count: 0, id: parsedUser.id};
            }

            dataStore.lrange('wondertrade' , 0, -1, function(error, result){
                var highChartsData = new HighChartsData(result),
                    dataByDateRange = highChartsData.getResultsByDateRange("2013-12-23", "2014-1-3"),
                    startDateOverride = new Date(2013, 11, 22),
                    endDateOverride = new Date(2014, 0, 3),
                    userTableWithCounts = highChartsData.getCountsByUserIdAndUserTable(dataByDateRange, userTable),
                    trendingPokemonChart = highChartsData.getCountTrendsByUsers(dataByDateRange, userTable, startDateOverride, endDateOverride);


                trendingPokemonChart = _.sortBy(trendingPokemonChart, 'fullCount');
                trendingPokemonChart.reverse();
                trendingPokemonChart = _.first(trendingPokemonChart, 10);

                response.render('contest', {
                    title: 'Project Contributers',
                    pageState: '',
                    user: request.user,
                    trendingPokemonChart: JSON.stringify(trendingPokemonChart),
                    userTable: userTableWithCounts,
                    redditUsers: ""
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

    app.get('/updates', function(request, response){
        response.render('updates', {
            title: 'Updates',
            pageState: '',
            user: request.user
        });
    });
};
