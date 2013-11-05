exports.initController =  function(app, dataStore, util) {
	var WondertradeModel = require('../models/wondertrade').model,
		PokemonList = require('../data/pokemonList.json'),
		PokemonHash = {};

	for(var pokemon in PokemonList) {
		PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
	}


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
				title: 'Wonder Trade List',
				pokemonHash: PokemonHash
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
		if(wondertrade) {
			dataStore.lpush('wondertrade', serializedWondertrade, function(err, size) {			
				response.render('wondertrade/new', {
					title: 'New Wonder Trade',
					pokemonList: PokemonList,
					state:	'post'
				});
				console.log('A new wondertrade was added');
			});	
		} else {
			response.send('There was an error with the pokemon you were loading...');
		}
				
	});

	// For development purposes only. Discard Afterward. Like 4srs.
	app.get('/wondertrade/generateTestData', function(request, response){
		var test1 = WondertradeModel({"pokemonId":"10","pokemonNickname":"10","hasItem":true,"hasHiddenAbility":false,"isShiny":false,"gender":"male","trainerCountry":"USA","trainerCountrySub1":"Test1","date":"2013-11-04","userId":"anonymous"}),
			test2 = WondertradeModel({"pokemonId":"25","pokemonNickname":"","hasItem":false,"hasHiddenAbility":false,"isShiny":false,"gender":"male","trainerCountry":"Japan","trainerCountrySub1":"Test2","date":"2013-11-04","userId":"Test"}),
			test3 = WondertradeModel({"pokemonId":"35","pokemonNickname":"35","hasItem":true,"hasHiddenAbility":true,"isShiny":false,"gender":"female","trainerCountry":"France","trainerCountrySub1":"Test3","date":"2013-11-05","userId":"anonymous"}),
			test4 = WondertradeModel({"pokemonId":"100","pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"isShiny":false,"gender":"female","trainerCountry":"France","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			test5 = WondertradeModel({"pokemonId":"150","pokemonNickname":"Awesome","hasItem":false,"hasHiddenAbility":false,"isShiny":true,"gender":"male","trainerCountry":"France","trainerCountrySub1":"Test5","date":"2013-11-04","userId":"anonymous"}),
			test6 = WondertradeModel({"pokemonId":"704","pokemonNickname":"Our Lord","hasItem":true,"hasHiddenAbility":true,"isShiny":true,"gender":"male","trainerCountry":"USA","trainerCountrySub1":"","date":"2013-11-04","userId":"Test"}),
			testArray = [test1, test2, test3, test4, test5, test6];

		dataStore.del('wondertrade');
		for(var testWT in testArray) {
			var stringifiedWT = JSON.stringify(testArray[testWT]);
			dataStore.lpush('wondertrade', stringifiedWT);
		}
		response.send('Alright, the test data has been loaded!');
	});
};