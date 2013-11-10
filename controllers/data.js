var _ = require('underscore'),
	HighChartsData = require('../models/HighChartsData').model,
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

function deserializeWT(result) {
	var deserializedWondertrades = [];
	for(var i = 0, max =  result.length;i<max;i++) {				
		var currentWonderTrade = result[i];
		if(typeof currentWonderTrade === "string"
			&& currentWonderTrade.charAt(0) === '{'
			&& currentWonderTrade.charAt(currentWonderTrade.length-1) === '}') {
			deserializedWondertrades.push(JSON.parse(currentWonderTrade));
		}
	}
	return deserializedWondertrades;
}

exports.initController = function(app, dataStore) {
	app.get('/data', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var highChartsData = new HighChartsData(result);			

			response.render('data/index', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result,
				PokemonHash: PokemonHash,
				CountryHash: CountryHash,	
				pokemonChart: JSON.stringify(highChartsData.getCountsByPokemon()),
				genderChart: JSON.stringify(highChartsData.getCountsByGender()),
				countryChart: JSON.stringify(highChartsData.getCountsByCountries())
			});
		});
	});


	app.get('/data/pokemon', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			var highChartsData = new HighChartsData(result);

			response.render('data/pokemon', {
				title: 'Wonder Trade Pokemon Analytics',
				pageState: '',
				result: result,
				trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon())
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


	// by Gender?
	// by Pokemon
	// by Date
	// by Country
	// by User	
};
