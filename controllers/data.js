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
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon()),
				genderChart: JSON.stringify(highChartsData.getCountsByGender()),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries())
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
				trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon()),
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),
				topTenPokemon: highChartsData.getTopTenPokemon(),
				pokemonList: PokemonList
			});
		});
	});

	app.get('/data/pokemon/:pokemonId', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var pokemonId = request.params.pokemonId
			var highChartsData = new HighChartsData(result),
				highChartsDataByPokemonId = highChartsData.getResultsByPokemon(pokemonId);

			//console.log(highChartsDataByPokemonId);

			response.render('data/pokemonById', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result,
				pokemonName: PokemonHash[pokemonId]
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
