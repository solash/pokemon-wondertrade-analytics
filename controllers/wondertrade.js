exports.initController =  function(app) {
	app.get('/wondertrade', function(request, response){
		response.render('wondertrade/index', {
			date: new Date()
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
		// code to save to datastore here
		response.render('wondertrade/show', {
			id:wondertrade_id,
			title: 'New Wonder Trade'
		});
	});
};