exports.initController =  function(app) {
	app.get('/wondertrade', function(request, response){
		response.render('wondertrade/index', {
			date: new Date()
		});
	});

	app.get('/wondertrade/new', function(request, response){
		response.render('wondertrade/new', {});
	});

	app.get('/wondertrade/:id', function(request, response){
		var wondertrade_id = request.params.id;
		response.render('wondertrade/show', {id:wondertrade_id});
	});

	app.post('/wondertrade/:id', function(request, response){
		var wondertrade_id = request.params.id;
		// code to save to datastore here
		response.render('wondertrade/show', {id:wondertrade_id});
	});
};