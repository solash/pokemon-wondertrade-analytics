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
				user: request.user,
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon()),
				genderChart: JSON.stringify(highChartsData.getCountsByGender()),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries())
			});
		});
	});


	app.get('/data/pokemon', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			var highChartsData = new HighChartsData(result),
				pokemonTable = highChartsData.getPokemonTable(),
				topTenPokemon = highChartsData.getTopTenPokemon(),
				topTenPokemonIds = _.map(topTenPokemon, function(pkmn){return pkmn[0]});			
			
			pokemonTable.reverse();

			response.render('data/pokemon', {
				title: 'Wonder Trade Pokemon Analytics',
				pageState: '',
				result: result,
				PokemonHash: PokemonHash,
				trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(false, topTenPokemonIds)),
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),
				topTenPokemon: topTenPokemon,
				pokemonList: PokemonList,
				user: request.user,
				pokemonTable: pokemonTable,
				quickstats: highChartsData.getQuickStats()
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
				user: request.user,
				trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(highChartsDataByPokemonId)),
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataByPokemonId)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByPokemonId)),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByPokemonId)),
				quickstats: highChartsData.getQuickStats(highChartsDataByPokemonId)
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
				regionsTable: regionsTable,
				user: request.user,
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
				subregionChart: JSON.stringify(highChartsData.getCountsBySubRegions(highChartsDataByRegionId)),
				quickstats: highChartsData.getQuickStats(highChartsDataByRegionId),
				user: request.user
			});
		});
	});
};
