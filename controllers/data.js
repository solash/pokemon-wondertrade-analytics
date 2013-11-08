var _ = require('underscore');
exports.initController = function(app, dataStore) {
	app.get('/data', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var pokemon = [],
				regions = [],
				gender = [];

			console.log(result);

			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result
			});
		});
	});


	app.get('/data/pokemon', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result
			});
		});
	});

	app.get('/data/pokemon/:name', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result
			});
		});
	});

	app.get('/data/regions', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result
			});
		});
	});

	app.get('/data/regions/:code', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result
			});
		});
	});


	// by Gender
	// by Pokemon
	// by Date
	// by Country
	// by User	
};
