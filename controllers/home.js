exports.initController = function(app, dataStore) {
	var WondertradeModel = require('../models/wondertrade').model,
		HighChartsData = require('../models/HighChartsData').model;

	app.get('/', function(request, response){			

		dataStore.lrange('wondertrade' , 0, -1, function(error, result){
			
			var highChartsData = new HighChartsData(result);

			response.render('home', {
				title: 'Homepage Title',
				pageState: 'warning',
				stateMessage: 'This app is very much in development still. Any data you enter here *will* be wiped. :x',
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate()),
				wondertradeCount: 70
			});
		});	
	});

	app.get('/about', function(request, response){	
		response.render('about', {
			title: 'About this Project',
			pageState: ''
		});		
	});
};
