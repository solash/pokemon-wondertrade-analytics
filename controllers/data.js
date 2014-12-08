var _ = require('underscore'),
	rest = require('restler'),
	parseString = require('xml2js').parseString,
	HighChartsData = require('../models/HighChartsData'),
	PokemonList = require('../data/pokemonList.json'),
	CountryList = require('../data/countryList.json'),
	UserTableModel = require('../models/UserTable'),
	RedditPostModel = require('../models/RedditPost'),
	PokemonHash = {},
	CountryHash = {};

for(var pokemon in PokemonList) {
	PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
}

for(var country in CountryList) {
	CountryHash[CountryList[country].id] = CountryList[country].name;
}



module.exports = function(app, dataStore, MemoryStore) {

	function setupHighChartsData(req, resp, next){

		req.highChartsData = MemoryStore.store.highChartsData;
		req.result= MemoryStore.store.highChartsResults;
		next();
	}

	function setupUserTableData(req, resp, next) {
		// TODO
	}

	function OverviewPage(req, resp){
		var highChartsData = req.highChartsData;
		resp.render('data/index', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			PokemonHash: PokemonHash,
			CountryHash: CountryHash,
			result: req.result,
			user: req.user,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon()),
			genderChart: JSON.stringify(highChartsData.getCountsByGender()),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries())
		});
	}

	function PokemonPage(req, resp){
		var highChartsData = req.highChartsData,
			pokemonTable = highChartsData.getPokemonTable(),
			topTenPokemon = highChartsData.getTopTenPokemon(),
			topTenPokemonIds = _.map(topTenPokemon, function(pkmn){return pkmn[0];});

		pokemonTable.reverse();

		resp.render('data/pokemon', {
			title: 'Pokemon Overview',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(false, topTenPokemonIds)),
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: pokemonTable,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon()),
			quickstats: highChartsData.getQuickStats()
		});
	}

	function PokemonByIdPage(req, resp){
		var pokemonId = req.params.pokemonId,
			highChartsData = req.highChartsData,
			highChartsDataByPokemonId = highChartsData.getResultsByPokemonId(pokemonId),
			nicknames = highChartsData.getNicknamesByResultSet(highChartsDataByPokemonId),
			pokemonName = PokemonHash[pokemonId];

		resp.render('data/pokemonById', {
			title: pokemonName+' Analytics',
			pageState: '',
			result: req.result,
			pokemonName: pokemonName,
			pokemonId: pokemonId,
			user: req.user,
			nicknames: nicknames,
			trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(highChartsDataByPokemonId)),
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataByPokemonId)),
			genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByPokemonId)),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByPokemonId)),
			quickstats: highChartsData.getQuickStats(highChartsDataByPokemonId)
		});
	}

	function RegionsPage(req, resp){
		var highChartsData = req.highChartsData,
			regionsTable = highChartsData.getRegionsTable();

		regionsTable.reverse();

		resp.render('data/regions', {
			title: 'Wonder Trade Region Analytics',
			pageState: '',
			regionsTable: regionsTable,
			user: req.user,
			totalCount: req.result.length,
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries())
		});
	}

	function RegionByIdPage(req, resp){
		var regionId = req.params.regionCode,
			highChartsData = req.highChartsData,
			highChartsDataByRegionId = highChartsData.getResultsByRegionId(regionId),
			timeTrends = highChartsData.getDataCountsSplitByTime(highChartsDataByRegionId),
			regionName = CountryHash[regionId];

		resp.render('data/regionById', {
			title: regionName+' Analytics',
			pageState: '',
			regionName: regionName,
			genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByRegionId)),
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByRegionId)),
			subregionChart: JSON.stringify(highChartsData.getCountsBySubRegions(highChartsDataByRegionId)),
			timeTrends: JSON.stringify(timeTrends),
			quickstats: highChartsData.getQuickStats(highChartsDataByRegionId),
			user: req.user
		});
	}

	function NicknamesPage(req, resp){

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result),
				highChartsData = req.highChartsData,
				highChartsDataWithNicknames = highChartsData.getNicknamesTable();

			resp.render('data/nicknames', {
				title: 'Nickname Analytics',
				pageState: '',
				wondertradeTable: highChartsDataWithNicknames,
				pokemonHash: PokemonHash,
				userTable: userTable,
				user: req.user
			});
		});
	}

	function HiddenAbilitiesPage(req, resp){
		var highChartsData = req.highChartsData,
			highChartsDataWithHiddenAbilities = highChartsData.getResultsWithHiddenAbilities(),
			pokemonTable = highChartsData.getPokemonTable(highChartsDataWithHiddenAbilities);


		pokemonTable.reverse();

		resp.render('data/hiddenAbilities', {
			title: 'Pokemon with Hidden Abilities',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataWithHiddenAbilities)),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataWithHiddenAbilities)),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: pokemonTable,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataWithHiddenAbilities)),
			quickstats: highChartsData.getQuickStats(highChartsDataWithHiddenAbilities)
		});
	}
	function PerfectIVPage(req, resp){
		var highChartsData = req.highChartsData,
			highChartsDataWithPerfectIV = highChartsData.getResultsWithPerfectIV(),
			pokemonTable = highChartsData.getPokemonTable(highChartsDataWithPerfectIV);

		pokemonTable.reverse();

		resp.render('data/perfectIV', {
			title: 'Pokemon with Hidden Abilities',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataWithPerfectIV)),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataWithPerfectIV)),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: pokemonTable,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataWithPerfectIV)),
			quickstats: highChartsData.getQuickStats(highChartsDataWithPerfectIV)
		});
	}

	function ShinyPage(req, resp){
		var highChartsData = req.highChartsData,
			highChartsDataWithPerfectIV = highChartsData.getResultsWithShinyPokemon(),
			pokemonTable = highChartsData.getPokemonTable(highChartsDataWithPerfectIV);

		pokemonTable.reverse();

		resp.render('data/shiny', {
			title: 'Shiny Pokemon',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataWithPerfectIV)),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataWithPerfectIV)),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: pokemonTable,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataWithPerfectIV)),
			quickstats: highChartsData.getQuickStats(highChartsDataWithPerfectIV)
		});
	}

	function GenderPage(req, resp){
		var highChartsData = req.highChartsData,
			maleResults = highChartsData.getResultsByGender('male'),
			femaleResults = highChartsData.getResultsByGender('female'),
			maleSortedSet = highChartsData.getSortedCountsByPokemon(maleResults),
			femaleSortedSet = highChartsData.getSortedCountsByPokemon(femaleResults);

		maleSortedSet = maleSortedSet.reverse();
		maleSortedSet =  _.first(maleSortedSet,10);

		femaleSortedSet = femaleSortedSet.reverse();
		femaleSortedSet =  _.first(femaleSortedSet,10);


		resp.render('data/gender', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			maleQuickstats: highChartsData.getQuickStats(maleResults),
			femaleQuickstats: highChartsData.getQuickStats(femaleResults),
			user: req.user,
			malePokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(maleResults)),
			maleCountryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(maleResults)),
			maleTopTenPokemon: maleSortedSet,
			femalePokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(femaleResults)),
			femaleCountryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(femaleResults)),
			femaleTopTenPokemon: femaleSortedSet
		});
	}

	function LevelsPage(req, resp){
		var highChartsData = req.highChartsData;

		resp.render('data/levels', {
			title: 'Level Analytics',
			pageState: '',
			result: req.result,
			PokemonHash: PokemonHash,
			CountryHash: CountryHash,
			user: req.user,
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),
		});
	}

	function LevelPage(req, resp){
		var pokemonLevel = req.params.pokemonLevel,
			highChartsData = req.highChartsData,
			highChartsDataByLevel = highChartsData.getResultsByPokemonLevel(pokemonLevel),
			integerPokemonLevel = parseInt(pokemonLevel, 10);

		resp.render('data/byLevel', {
			title: 'Level '+integerPokemonLevel+' Analytics',
			pageState: '',
			result: req.result,
			pokemonLevel: integerPokemonLevel,
			user: req.user,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByLevel)),
			genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByLevel)),
			countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByLevel)),
			quickstats: highChartsData.getQuickStats(highChartsDataByLevel)
		});
	}

	function DatesPage(req, resp){
		var highChartsData = req.highChartsData,
			statTrendsByDate = highChartsData.getQuickStatsTrendsByDates();

		resp.render('data/dates', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			user: req.user,
			stateMessage: '',
			quickStatTrends: JSON.stringify(statTrendsByDate)
		});
	}

	function DatePage(req, resp){
		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result),
				submissionDate = req.params.submissionDate,
				highChartsData = req.highChartsData,
				highChartsDataBySubmissionDate = highChartsData.getResultsBySubmissionDate(submissionDate),
				pokemonTable = highChartsData.getPokemonTable(highChartsDataBySubmissionDate),
				userChart = highChartsData.getCountsByUserIdAndUserTableFormatted(highChartsDataBySubmissionDate, userTable);

			pokemonTable.reverse();

			resp.render('data/datesByDay', {
				title: ' Analytics for '+submissionDate,
				pageState: '',
				user: req.user,
				submissionDate: submissionDate,
				userChart: JSON.stringify(userChart),
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate(highChartsDataBySubmissionDate)),
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataBySubmissionDate)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataBySubmissionDate)),
				pokemonTable: pokemonTable,
				quickstats: highChartsData.getQuickStats(highChartsDataBySubmissionDate),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataBySubmissionDate))
			});

		});
	}


	function DateRangePage (req, resp) {
		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result),
				startDate = req.params.startDate,
				endDate = req.params.endDate || 'Now',
				highChartsData = req.highChartsData,
				highChartsDataBySubmissionDate = highChartsData.getResultsByDateRange(startDate, endDate),
				pokemonTable = highChartsData.getPokemonTable(highChartsDataBySubmissionDate),
				userChart = highChartsData.getCountsByUserIdAndUserTableFormatted(highChartsDataBySubmissionDate, userTable);

			pokemonTable.reverse();

			resp.render('data/dateRange', {
				title: ' Analytics for ' + startDate + ' - ' + endDate,
				pageState: '',
				user: req.user,
				startDate: startDate,
				endDate: endDate,
				userChart: JSON.stringify(userChart),
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate(highChartsDataBySubmissionDate)),
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataBySubmissionDate)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataBySubmissionDate)),
				pokemonTable: pokemonTable,
				quickstats: highChartsData.getQuickStats(highChartsDataBySubmissionDate),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataBySubmissionDate))
			});

		});
	}


	function TimePage(req, resp) {
		var highChartsData = req.highChartsData,
			dataSplitByTime = highChartsData.getDataSplitByTime(),
			statTrendsByTime = highChartsData.getQuickStatsTrendsByTime(dataSplitByTime);

		resp.render('data/times', {
			title: 'WonderTrade Data by Submission Time',
			pageState: '',
			user: req.user,
			stateMessage: '',
			quickStatTrends: JSON.stringify(statTrendsByTime)
		});
	}

	function LikesPage(req, resp){
		var highChartsData = req.highChartsData,
			pokemonLikenessList = highChartsData.getCommunityLikes();

		resp.render('data/likes', {
			title: 'Wonder Trade Sentiment',
			pageState: '',
			user: req.user,
			pokemonLikenessList: pokemonLikenessList
		});
	}

	function OTPage(req, resp){
		var highChartsData = req.highChartsData,
			originalTrainers = highChartsData.getOriginalTrainers();

		resp.render('data/originalTrainers', {
			title: 'Original Trainer\'s recorded',
			pageState: '',
			user: req.user,
			originalTrainers: originalTrainers
		});
	}

	function OTPageById(req, resp){
		var highChartsData = req.highChartsData,
			trainerId = req.params.trainerId,
			originalTrainers = highChartsData.getOriginalTrainersById(trainerId);

		resp.render('data/originalTrainersById', {
			title: 'Wonder Trades By '+trainerId,
			pageState: '',
			user: req.user,
			originalTrainers: originalTrainers
		});
	}

	function UserIdPage(req, resp){

		var userId = req.params.userId;

		dataStore.lrange('redditUser' , 0, -1, function(error, result){
			var redditUserName = '';
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				if(parsedUser.userId == userId) {
					redditUserName = parsedUser.redditUserName;
				}
			}

			dataStore.lrange('userTable' , 0, -1, function(error, result){
				var userTable = new UserTableModel(result);

				var highChartsData = req.highChartsData,
					highChartsDataByUserId = highChartsData.getResultsByUserId(userId),
					pokemonTable = highChartsData.getPokemonTable(highChartsDataByUserId),
					trendsByDate = highChartsData.getTrendsByDate(highChartsDataByUserId),
					submissionDates = highChartsData.getSubmissionDates(highChartsDataByUserId),
					userName = userTable[userId];

				pokemonTable.reverse();

				var mav = {
					title: ' Analytics for '+userName,
					pageState: '',
					user: req.user,
					username: userName,
					userId: userId,
					wondertradeTends: JSON.stringify(trendsByDate),
					submissionDates: submissionDates,
					pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByUserId)),
					genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByUserId)),
					levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataByUserId)),
					pokemonTable: pokemonTable,
					quickstats: highChartsData.getQuickStats(highChartsDataByUserId),
					countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByUserId)),
					redditResults: false
				};

				if (redditUserName && redditUserName !== '') {
					var redditPostsRequest = rest.get('http://www.reddit.com/r/WonderTrade/search.rss?q=subreddit%3Awondertrade+author%3A'+redditUserName);
					redditPostsRequest.once('complete', function(data) {
						parseString(data, function (err, result) {

							if(result && result.rss && result.rss.channel && result.rss.channel[0]) {
								var redditPosts = [];
								for(var item in result.rss.channel[0].item) {
									var redditItem = result.rss.channel[0].item[item];
									if(redditItem) {
										var redditPost = new RedditPostModel(redditItem);
										redditPosts.push(redditPost);
									}
								}
								mav.redditResults = redditPosts;
							}
							resp.render('data/user', mav);

							redditPostsRequest.removeAllListeners('error');
						});
					});
				} else {
					resp.render('data/user', mav);
				}

			});
		});
	}

	function UserIdDatePage(req, resp){

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result),
				userId = req.params.userId,
				submissionDate = req.params.submissionDate,
				highChartsData = req.highChartsData,
				highChartsDataByUserId = highChartsData.getResultsByUserIdAndSubmissionDate(userId, submissionDate),
				pokemonTable = highChartsData.getPokemonTable(highChartsDataByUserId),
				userName = userTable[userId];

			pokemonTable.reverse();

			resp.render('data/userDate', {
				title: ' Analytics for '+userName,
				pageState: '',
				user: req.user,
				username: userName,
				submissionDate: submissionDate,
				wondertradeTends: JSON.stringify(highChartsData.getTrendsByDate(highChartsDataByUserId)),
				pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByUserId)),
				genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByUserId)),
				levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(highChartsDataByUserId)),
				pokemonTable: pokemonTable,
				quickstats: highChartsData.getQuickStats(highChartsDataByUserId),
				countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByUserId))
			});

		});
	}

	function GroupsPage(req, resp) {
		resp.render('data/groups', {
			title: 'Pokemon Data Sorted by Custom Groups',
			pageState: '',
			user: req.user
		});
	}

	function GroupsPage_Eevee(req, resp, next) {
		req.groupName = "Eeveelutions";
		req.pokemonGroupArray = [134, 135, 136, 196, 197, 470, 471, 700];
		next();
	}
	function GroupsPage_Starters(req, resp, next) {
		req.groupName = "Starters";
		req.pokemonGroupArray = [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656];
		next();
	}
	function GroupsPage_TradeEvos(req, resp, next) {
		req.groupName = "Trade Evolutions";
		req.pokemonGroupArray = [64, 67, 75, 93, 525, 533, 708, 711];
		next();
	}

	function GroupsPage_TrioLegendary(req, resp, next) {
		req.groupName = "Trio Legendarys";
		req.pokemonGroupArray = [144, 145, 146, 243, 244, 245, 377, 378, 379, 480, 481, 482, 638, 639, 640];
		next();
	}

	function GroupsPage_VersionExclusive(req, resp, next) {
		req.groupName = "Version Exclusives";
		req.pokemonGroupArray = [120, 121, 127, 228, 229, 261, 262, 304, 305,306,345,346,347,348,539,684,685,692,693,716,90,91,138,139,140,141,214,246,247,248,309,310,509,510,538,682,683,690,691,717];
		next();
	}

	function GroupsPage_PokeBank(req, resp, next) {
		req.groupName = "PokeBank Only";
		req.pokemonGroupArray = [19,20,52,53,109,110,137,151,152,153,154,155,156,157,158,159,160,200,201,233,234,243,244,245,249,250,251,252,253,254,258,259,260,287,288,289,343,344,349,350,351,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,401,402,420,421,427,428,429,431,432,456,457,474,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,546,547,554,555,562,563,592,593,602,603,604,605,606,626,638,639,640,641,642,643,644,645,646,647,648,649];
		next();
	}

	function RenderGroupData(req, resp) {
		var highChartsData = req.highChartsData,
			pokemonGroupArray = req.pokemonGroupArray,
			filterdResults = highChartsData.filterGroupsOfPokemon(pokemonGroupArray),
			pokemonTable = highChartsData.getPokemonTable(filterdResults);

		pokemonTable.reverse();

		resp.render('data/groupsData', {
			title: req.groupName,
			pageState: '',
			result: req.result,
			pokemonGroupArray: pokemonGroupArray,
			PokemonHash: PokemonHash,
			trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(filterdResults)),
			levelBarChart: JSON.stringify(highChartsData.getCountsByLevels(filterdResults)),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: pokemonTable,
			pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(filterdResults)),
			quickstats: highChartsData.getQuickStats(filterdResults)
		});
	}

	function getVisualizeData(req, resp){
		var highChartsData = req.highChartsData,
			pokemonIdList = highChartsData.getPokemonIds();

		resp.render('visualize', {
			title: 'Visualized Wonder Trades',
			pageState: '',
			pokemonIdList: pokemonIdList
		});
	}

	function RecentWonderTradesPage(req, res) {
		dataStore.lrange('userTable' , 0, -1, function(error, result){
			var userTable = new UserTableModel(result),
				highChartsData = req.highChartsData;

			res.render('wondertrade/index', {
				wondertrades: highChartsData.deserializedResults.slice(0, 100),
				title: 'Wonder Trade List',
				pokemonHash: PokemonHash,
				countryHash: CountryHash,
				pageState: '',
				userTable: userTable,
				user: req.user
			});
		});
	}

	app.get('/data', setupHighChartsData, OverviewPage);

	// Setup the highcharts Object before each /data/* request
	app.get('/data/*', setupHighChartsData);
	app.get('/data/pokemon', PokemonPage);
	app.get('/data/pokemon/:pokemonId', PokemonByIdPage);
	app.get('/data/regions', RegionsPage);
	app.get('/data/regions/:regionCode', RegionByIdPage);
	app.get('/data/nicknames', NicknamesPage);
	app.get('/data/hiddenAbilities', HiddenAbilitiesPage);
	app.get('/data/perfectIV', PerfectIVPage);
	app.get('/data/shiny', ShinyPage);
	app.get('/data/gender', GenderPage);
	app.get('/data/levels', LevelsPage);
	app.get('/data/levels/:pokemonLevel', LevelPage);
	app.get('/data/dates', DatesPage);
	app.get('/data/dates/:submissionDate', DatePage);
	app.get('/data/daterange/:startDate/now', DateRangePage);
	app.get('/data/daterange/:startDate/:endDate', DateRangePage);
	app.get('/data/likes', LikesPage);
	app.get('/data/time', TimePage);
	app.get('/data/recent', RecentWonderTradesPage);

	app.get('/groups', GroupsPage);
	app.get('/groups/*', setupHighChartsData);
	app.get('/groups/eeveelutions', GroupsPage_Eevee, RenderGroupData);
	app.get('/groups/starters', GroupsPage_Starters, RenderGroupData);
	app.get('/groups/trade-evos', GroupsPage_TradeEvos, RenderGroupData);
	app.get('/groups/trio-legendarys', GroupsPage_TrioLegendary, RenderGroupData);
	app.get('/groups/version-exclusives', GroupsPage_VersionExclusive, RenderGroupData);
	app.get('/groups/pokebanks', GroupsPage_PokeBank, RenderGroupData);


	app.get('/originalTrainers', setupHighChartsData, OTPage);
	app.get('/originalTrainers/:trainerId', setupHighChartsData, OTPageById);

	// TODO: setupUserTableData, and consider moving this to a separate controller?
	app.get('/users/*', setupHighChartsData);
	app.get('/users/:userId', UserIdPage);
	app.get('/users/:userId/date/:submissionDate', UserIdDatePage);

	app.get('/visualize', setupHighChartsData, getVisualizeData);
};
