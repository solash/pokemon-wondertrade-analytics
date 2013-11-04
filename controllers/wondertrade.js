exports.initController =  function(app, dataStore) {
	var WondertradeModel = require('../models/wondertrade').model;
	app.get('/wondertrade', function(request, response){
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			response.render('wondertrade/index', {
				wondertrades: result,
				date: new Date(),
				title: 'Wonder Trade List'
			});
		});		
		
	});

	app.get('/wondertrade/show/:id', function(request, response){
		var wondertrade_id = request.params.id;

		response.render('wondertrade/show', {
			id:wondertrade_id,
			title: 'WonderTrade By ID'
		});
	});

	app.get('/wondertrade/new', function(request, response){
		response.render('wondertrade/new', {
			title: 'New Wonder Trade'
		});
	});

	app.post('/wondertrade/new', function(request, response){		
		var WondertradeParams = request.body,
			wondertrade = WondertradeModel(WondertradeParams);
			
		dataStore.lpush('wondertrade', wondertrade, function(err, size) {
			console.log('Wondertrade size: '+size);
		});

		response.render('wondertrade/new', {
			title: 'New Wonder Trade'			
		});
	});
};