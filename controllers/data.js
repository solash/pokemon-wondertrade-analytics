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
				pokemonList: PokemonList,
				shinyPercentage: highChartsData.getShinyPercentage(),
				hiddenAbilityPercentage: highChartsData.getHiddenAbilityPercentage(),
				itemPercentage: highChartsData.getItemPercentage(),
				pokerusPercentage: highChartsData.getPokerusPercentage()
			});
		});
	});

	app.get('/data/pokemon/:pokemonId', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var pokemonId = request.params.pokemonId,
				highChartsData = new HighChartsData(result),
				highChartsDataByPokemonId = highChartsData.getResultsByPokemonId(pokemonId);

			response.render('data/pokemonById', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				result: result,
				pokemonName: PokemonHash[pokemonId],
				trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(highChartsDataByPokemonId)),
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataByPokemonId)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByPokemonId)),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByPokemonId))
			});
		});
	});

	app.get('/data/regions', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var highChartsData = new HighChartsData(result),
				regionsTable = highChartsData.getRegionsTable();

			regionsTable.reverse();

			response.render('data/regions', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				regionsTable: regionsTable
			});
		});
	});

	app.get('/data/regions/:regionCode', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){

			var regionId = request.params.regionCode,
				highChartsData = new HighChartsData(result),
				highChartsDataByRegionId = highChartsData.getResultsByRegionId(regionId);

			response.render('data/regionById', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				regionName: CountryHash[regionId],
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByRegionId)),
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByRegionId)),
				subregionChart: JSON.stringify(highChartsData.getCountsBySubRegions(highChartsDataByRegionId))
			});
		});
	});


	// by Gender?
	// by Pokemon
	// by Date
	// by Country
	// by User	
};
