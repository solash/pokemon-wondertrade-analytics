exports.initController = function(app, dataStore) {
	app.get('/', function(request, response){	
		response.render('home', {
			title: 'Homepage Title'
		});
		dataStore.get('test', function(err, result) {
			console.log('from the datastore:'+result);
		});
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			console.log(result);
		});
	});

	app.get('/about', function(request, response){	
		response.render('about', {
			title: 'About this Project'
		});		
	});
};
