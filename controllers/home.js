exports.initController = function(app, dataStore) {
	app.get('/', function(request, response){	
		response.render('home', {
			date: new Date(),
			title: 'Homepage Title'
		});
		dataStore.get('test', function(err, msg) {
			console.log('from the datastore:'+msg);
		});
	});
};
