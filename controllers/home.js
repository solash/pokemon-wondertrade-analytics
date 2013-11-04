exports.initController = function(app, dataStore) {
	app.get('/', function(request, response){	
		response.render('home', {
			date: new Date(),
			title: 'Homepage Title'
		});
		dataStore.get('test', function(err, result) {
			console.log('from the datastore:'+result);
		});
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			console.log(result);
		});
	});
};
