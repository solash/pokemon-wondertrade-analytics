module.exports = function(app, dataStore) {
	var WondertradeModel = require('../models/wondertrade'),
		HighChartsData = require('../models/HighChartsData'),
		_ = require('underscore'),
        formatNumber = function(number, n,x) {

            // http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
            var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return number.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
        };



	app.get('/', function(request, response){					
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){
			
			var highChartsData = new HighChartsData(result),
                totalCount = result.length,
                formattedCount = formatNumber(totalCount, 0, 3);

			response.render('home', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				user: request.user,
				stateMessage: '',
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate()),
				wondertradeCount: formattedCount
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

	app.get('/contributors', function(request, response){

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

                    response.render('contributors', {
                        title: 'Project Contributors',
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

    app.get('/contest', function(req, resp){
        resp.redirect('/');
    });

    app.get('/help', function(request, response){
		response.render('help', {
			title: 'Wonder Trade Contributors',
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
