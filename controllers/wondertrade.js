exports.initController =  function(app, dataStore, util) {
	var WondertradeModel = require('../models/wondertrade').model;
	var PokemonList = require('../data/pokemonList.json');

	app.get('/wondertrade', function(request, response){
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var deserializedWondertrades = [];			
			for(var i = 0, max =  result.length;i<max;i++) {				
				var currentWonderTrade = result[i];
				if(typeof currentWonderTrade === "string"
					&& currentWonderTrade.charAt(0) === '{'
					&& currentWonderTrade.charAt(currentWonderTrade.length-1) === '}') {
					deserializedWondertrades.push(JSON.parse(currentWonderTrade));
				}
			}
			
			response.render('wondertrade/index', {
				wondertrades: deserializedWondertrades,
				date: new Date(),
				title: 'Wonder Trade List'
			});
		});		
		
	});

	app.get('/wondertrade/new', function(request, response){
		response.render('wondertrade/new', {
			title: 'New Wonder Trade',
			pokemonList: PokemonList,
			state:	'form'
		});
	});

	app.post('/wondertrade/new', function(request, response){		
		var WondertradeParams = request.body,
			wondertrade = WondertradeModel(WondertradeParams),
			serializedWondertrade = JSON.stringify(wondertrade);

		dataStore.lpush('wondertrade', serializedWondertrade, function(err, size) {			
			response.render('wondertrade/new', {
				title: 'New Wonder Trade',
				pokemonList: PokemonList,
				state:	'post'
			});
			console.log('A new wondertrade was added');
		});

		
	});
};