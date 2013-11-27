var _ = require('underscore'),
	HighChartsData = require('../models/HighChartsData').model,
	PokemonList = require('../data/pokemonList.json'),
	CountryList = require('../data/countryList.json'),
	UserTableModel = require('../models/UserTable').model,
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
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon()),
				quickstats: highChartsData.getQuickStats()
			});
		});
	});

	app.get('/data/pokemon/:pokemonId', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var pokemonId = request.params.pokemonId,
				highChartsData = new HighChartsData(result),
				highChartsDataByPokemonId = highChartsData.getResultsByPokemonId(pokemonId),
				pokemonName = PokemonHash[pokemonId];

			response.render('data/pokemonById', {
				title: pokemonName+' Analytics',
				pageState: '',
				result: result,
				pokemonName: pokemonName,
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
				title: 'Wonder Trade Region Analytics',
				pageState: '',
				regionsTable: regionsTable,
				user: request.user,
				totalCount: result.length,
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries())
			});
		});
	});

	app.get('/data/regions/:regionCode', function(request, response){					
		dataStore.lrange('wondertrade' ,0, -1, function(error, result){

			var regionId = request.params.regionCode,
				highChartsData = new HighChartsData(result),
				highChartsDataByRegionId = highChartsData.getResultsByRegionId(regionId),
				regionName = CountryHash[regionId];

			response.render('data/regionById', {
				title: regionName+' Analytics',
				pageState: '',
				regionName: regionName,
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByRegionId)),
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByRegionId)),
				subregionChart: JSON.stringify(highChartsData.getCountsBySubRegions(highChartsDataByRegionId)),
				quickstats: highChartsData.getQuickStats(highChartsDataByRegionId),
				user: request.user
			});
		});
	});

	app.get('/data/nicknames', function(request, response){

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result);

			dataStore.lrange('wondertrade' ,0, -1, function(error, result){
				var highChartsData = new HighChartsData(result),
					highChartsDataWithNicknames = highChartsData.getNicknamesTable();

				response.render('data/nicknames', {
					title: 'Nickname Analytics',
					pageState: '',
					wondertradeTable: highChartsDataWithNicknames,
					pokemonHash: PokemonHash,
					userTable: userTable,
					user: request.user
				});
			});

		});

		
	});

	app.get('/data/levels', function(request, response){

		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var highChartsData = new HighChartsData(result);			

			response.render('data/levels', {
				title: 'Level Analytics',
				pageState: '',
				result: result,
				PokemonHash: PokemonHash,
				CountryHash: CountryHash,
				user: request.user,
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),				
			});
		});
		
	});

	app.get('/data/hiddenAbilities', function(request, response){

		dataStore.lrange('wondertrade' ,0, -1, function(error, result){			
			var highChartsData = new HighChartsData(result),
				highChartsDataWithHiddenAbilities = highChartsData.getResultsWithHiddenAbilities(),
				pokemonTable = highChartsData.getPokemonTable(highChartsDataWithHiddenAbilities);
				
			
			pokemonTable.reverse();

			response.render('data/hiddenAbilities', {
				title: 'Pokemon with Hidden Abilities',
				pageState: '',
				result: result,
				PokemonHash: PokemonHash,				
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataWithHiddenAbilities)),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataWithHiddenAbilities)),
				pokemonList: PokemonList,
				user: request.user,
				pokemonTable: pokemonTable,
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataWithHiddenAbilities)),
				quickstats: highChartsData.getQuickStats(highChartsDataWithHiddenAbilities)
			});
		});
		
	});

	app.get('/data/levels/:pokemonLevel', function(request, response){

		dataStore.lrange('wondertrade' ,0, -1, function(error, result){
			var pokemonLevel = request.params.pokemonLevel,
				highChartsData = new HighChartsData(result),
				highChartsDataByLevel = highChartsData.getResultsByPokemonLevel(pokemonLevel),
				integerPokemonLevel = parseInt(pokemonLevel, 10);

			response.render('data/byLevel', {
				title: 'Level '+integerPokemonLevel+' Analytics',
				pageState: '',
				result: result,
				pokemonLevel: integerPokemonLevel,
				user: request.user,
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByLevel)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByLevel)),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByLevel)),
				quickstats: highChartsData.getQuickStats(highChartsDataByLevel)
			});
		});
		
	});



	// Show the individual user page.
	app.get('/users/:userId', function(request, response){

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result);

			dataStore.lrange('wondertrade' ,0, -1, function(error, result){
				var userId = request.params.userId,
					highChartsData = new HighChartsData(result),
					highChartsDataByUserId = highChartsData.getResultsByUserId(userId),
					pokemonTable = highChartsData.getPokemonTable(highChartsDataByUserId),
					userName = userTable[userId];

				pokemonTable.reverse();

				response.render('data/user', {
					title: ' Analytics for '+userName,
					pageState: '',
					user: request.user,
					wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate(highChartsDataByUserId)),
					pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByUserId)),
					genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByUserId)),
					pokemonTable: pokemonTable,
					countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByUserId))
				});
			});

		});		
	});

};
