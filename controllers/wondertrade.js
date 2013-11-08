exports.initController =  function(app, dataStore, util) {
	var WondertradeModel = require('../models/wondertrade').model,
		PokemonList = require('../data/pokemonList.json'),
		CountryList = require('../data/countryList.json'),
		PokemonHash = {},
		CountryHash = {};

	for(var pokemon in PokemonList) {
		PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
	}

	for(var country in CountryList) {
		CountryHash[CountryList[country].id] = CountryList[country].name;
	}


	app.get('/wondertrade', function(request, response){
		dataStore.lrange('wondertrade' ,0, 100, function(error, result){
			var deserializedWondertrades = [];			
			for(var i = 0, max =  result.length;i<max;i++) {				
				var currentWonderTrade = result[i];
				if(typeof currentWonderTrade === "string"
					&& currentWonderTrade.charAt(0) === '{'
					&& currentWonderTrade.charAt(currentWonderTrade.length-1) === '}') {
					deserializedWondertrades.push(JSON.parse(currentWonderTrade));
				}
			}
			// Debug ALL THE THINGS: console.log(result);
			response.render('wondertrade/index', {
				wondertrades: deserializedWondertrades,
				date: new Date(),
				title: 'Wonder Trade List',
				pokemonHash: PokemonHash,
				countryHash: CountryHash,
				pageState: ''
			});
		});		
		
	});

	app.get('/wondertrade/new', function(request, response){
		response.render('wondertrade/new', {
			title: 'New Wonder Trade',
			pokemonList: PokemonList,
			countryList: CountryList,
			pageState: '',
			stateMessage:	''
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
					countryList: CountryList,
					pageState: 'success',
					stateMessage:	'Your Wonder Trade was successfully added.'
				});
				console.log('A new wondertrade was added');
			});	
		} else {
			response.render('wondertrade/new', {
				title: 'New Wonder Trade',
				pokemonList: PokemonList,
				countryList: CountryList,
				pageState: 'error',
				stateMessage:	'There was a problem adding your last wonder trade.'
			});
		}
				
	});

	// For development purposes only. Discard Afterward. Like 4srs.
	app.get('/wondertrade/generateTestData', function(request, response){
		var testArray = [
			WondertradeModel({"pokemonId":63,"pokemonNickname":"abby","hasItem":true,"hasHiddenAbility":true,"hasPokerus":true,"isShiny":true,"trainerGender":"female","trainerCountry":"NO","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":220,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"","trainerCountry":"CA","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":100,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Kyoto","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":16,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"CN","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-05","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-05","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-05","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-02","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":8,"pokemonNickname":"war","hasItem":false,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":true,"trainerGender":"female","trainerCountry":"US","trainerCountrySub1":"Florida","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":4,"pokemonNickname":"","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"New York","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-06","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-05","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-03","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-02","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":679,"pokemonNickname":"Hone","hasItem":false,"hasHiddenAbility":true,"hasPokerus":false,"isShiny":false,"trainerGender":"female","trainerCountry":"JP","trainerCountrySub1":"Tokyo","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-07","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-04","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-01","userId":"anonymous"}),
			WondertradeModel({"pokemonId":25,"pokemonNickname":"","hasItem":true,"hasHiddenAbility":false,"hasPokerus":false,"isShiny":false,"trainerGender":"male","trainerCountry":"US","trainerCountrySub1":"","date":"2013-11-01","userId":"anonymous"})
		];

		dataStore.del('wondertrade');
		for(var testWT in testArray) {
			var stringifiedWT = JSON.stringify(testArray[testWT]);
			dataStore.lpush('wondertrade', stringifiedWT);
		}
		response.send('Alright, the test data has been loaded!');
	});
};