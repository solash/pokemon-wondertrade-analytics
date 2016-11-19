var _ = require('underscore'),
	rest = require('restler'),
	parseString = require('xml2js').parseString,
	HighCharts = require('./highCharts'),
	UserTableModel = require('../models/UserTable'),
	RedditPostModel = require('../models/RedditPost');

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = function(app, dataStore, MemoryStore) {

	var PokemonList = MemoryStore.store.PokemonList,
		PokemonHash = MemoryStore.store.PokemonHash,
		CountryHash = MemoryStore.store.CountryHash;

	function setupHighChartsData(req, res, next){

		req.highChartsData = MemoryStore.store.highChartsData;
		req.resultSize = MemoryStore.store.highChartsSize;
		req.data = {};
		next();
	}

	function setupUserTableData(req, res, next) {

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			req.userTable = new UserTableModel(result);
			next();
		});
	}

	function findRedditUserName (req, res, next) {

		var userId = req.params.userId;
		dataStore.lrange('redditUser' , 0, -1, function(error, result){

			for(var i = 0, max = result.length;i < max;i++) {
				var parsedUser = JSON.parse(result[i]);
				if(parsedUser.userId == userId) {
					req.data.redditUserName = parsedUser.redditUserName;
					return next();
				}
			}

			next();
		});
	}

	function OverviewPage(req, resp) {
		resp.render('data/index', {
			title: 'Wonder Trade Analytics',
			totalCount: req.resultSize,
			pageState: '',
			PokemonHash: PokemonHash,
			CountryHash: CountryHash,
			user: req.user,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries)
		});
	}
	function PokemonPage(req, resp){
		resp.render('data/pokemon', {
			title: 'Pokemon Overview',
			pageState: '',
			PokemonHash: PokemonHash,
			trendingPokemonChart: JSON.stringify(req.data.cachedTrendByPokemonIds),
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			pokemonList: PokemonList,
			user: req.user,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}
	function PokemonByIdPage(req, res) {
		var pokemonId = parseInt(req.params.pokemonId, 10),
			pokemonName = PokemonHash[pokemonId];

		if (!(pokemonId > 0 && pokemonId <= 801)) {
			return res.redirect('404');
		}

		res.render('data/pokemonById', {
			title: pokemonName+' Analytics',
			pageState: '',
			pokemonName: pokemonName,
			pokemonId: pokemonId,
			user: req.user,
			nicknames: req.data.nicknames,
			trendingPokemonChart: JSON.stringify(req.data.cachedTrendByPokemonId),
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			genderChart: JSON.stringify(req.data.countsByGender),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			quickstats: req.data.quickstats
		});
	}
	function RegionsPage(req, resp){
		resp.render('data/regions', {
			title: 'Wonder Trade Region Analytics',
			pageState: '',
			user: req.user,
			totalCount: req.resultSize,
			countryList: req.data.sortedCountsByCountries,
			countryChart: JSON.stringify(req.data.sortedCountsByCountries)
		});
	}
	function RegionByIdPage(req, resp){
		var regionId = req.params.regionCode,
			regionName = CountryHash[regionId];

		resp.render('data/regionById', {
			title: regionName+' Analytics',
			pageState: '',
			regionName: regionName,
			genderChart: JSON.stringify(req.data.countsByGender),
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			subregionChart: JSON.stringify(req.data.countsBySubRegions),
			timeTrends: JSON.stringify(req.data.dataCountsSplitByTime),
			quickstats: req.data.quickstats,
			user: req.user
		});
	}
	function HiddenAbilitiesPage(req, resp){
		resp.render('data/hiddenAbilities', {
			title: 'Pokemon with Hidden Abilities',
			pageState: '',
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: req.data.sortedCountsByPokemon,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}
	function PerfectIVPage(req, resp){
		resp.render('data/perfectIV', {
			title: 'Pokemon with Perfect IVs',
			pageState: '',
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: req.data.sortedCountsByPokemon,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}
	function ShinyPage(req, resp){
		resp.render('data/shiny', {
			title: 'Shiny Pokemon',
			pageState: '',
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: req.data.sortedCountsByPokemon,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}

	function GenderPage(req, resp){
		var genderData = req.data.genderData;

		resp.render('data/gender', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			PokemonHash: PokemonHash,
			maleQuickstats: genderData.maleQuickstats,
			femaleQuickstats: genderData.femaleQuickstats,
			user: req.user,
			malePokemonChart: JSON.stringify(genderData.malePokemonChart),
			maleCountryChart: JSON.stringify(genderData.maleCountryChart),
			maleTopTenPokemon: genderData.maleTopTenPokemon,
			femalePokemonChart: JSON.stringify(genderData.femalePokemonChart),
			femaleCountryChart: JSON.stringify(genderData.femaleCountryChart),
			femaleTopTenPokemon: genderData.femaleTopTenPokemon
		});
	}

	function LevelsPage(req, resp){
		resp.render('data/levels', {
			title: 'Level Analytics',
			pageState: '',
			PokemonHash: PokemonHash,
			CountryHash: CountryHash,
			user: req.user,
			levelBarChart: JSON.stringify(req.data.countsByLevels)
		});
	}
	function LevelPage(req, resp){
		var pokemonLevel = req.params.pokemonLevel,
			integerPokemonLevel = parseInt(pokemonLevel, 10);

		resp.render('data/byLevel', {
			title: 'Level '+integerPokemonLevel+' Pokemon Analytics',
			pageState: '',
			pokemonLevel: integerPokemonLevel,
			user: req.user,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			genderChart: JSON.stringify(req.data.countsByGender),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			quickstats: req.data.quickstats
		});
	}
	function DatesPage(req, resp){
		resp.render('data/dates', {
			title: 'Wonder Trade Trends (By Date)',
			pageState: '',
			user: req.user,
			stateMessage: '',
			quickStatTrends: JSON.stringify(req.data.cachedQuickStatsTrendsByDates)
		});
	}
	function DatePage(req, resp){

		var submissionDate = req.params.submissionDate;

		resp.render('data/datesByDay', {
			title: ' Analytics for '+submissionDate,
			pageState: '',
			user: req.user,
			submissionDate: submissionDate,
			userChart: JSON.stringify(req.data.countsByUserIdAndUserTableFormatted),
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			pokemonTable: req.data.sortedCountsByPokemon,
			quickstats: req.data.quickstats,
			countryChart: JSON.stringify(req.data.sortedCountsByCountries)
		});
	}
	function DateRangePage (req, resp) {

		var startDate = req.params.startDate,
			endDate = req.params.endDate || 'Now';

		resp.render('data/dateRange', {
			title: ' Analytics for ' + startDate + ' - ' + endDate,
			pageState: '',
			user: req.user,
			startDate: startDate,
			endDate: endDate,
			userChart: JSON.stringify(req.data.countsByUserIdAndUserTableFormatted),
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			genderChart: JSON.stringify(req.data.countsByGender),
			pokemonTable: req.data.sortedCountsByPokemon,
			quickstats: req.data.quickstats,
			countryChart: JSON.stringify(req.data.sortedCountsByCountries)
		});
	}
	function TimePage(req, resp) {
		resp.render('data/times', {
			title: 'WonderTrade Data by Submission Time',
			pageState: '',
			user: req.user,
			stateMessage: '',
			quickStatTrends: JSON.stringify(req.data.quickStatsTrendsByTime)
		});
	}
	function LikesPage(req, resp){
		resp.render('data/likes', {
			title: 'Wonder Trade Sentiment',
			pageState: '',
			user: req.user,
			pokemonLikenessList: req.data.communityLikes
		});
	}
	function OTPage(req, resp){
		resp.render('data/originalTrainers', {
			title: 'Original Trainer\'s recorded',
			pageState: '',
			user: req.user
		});
	}
	function UserIdPage(req, resp){

		var userId = req.params.userId,
			userName = req.userTable[userId],
			redditUserName = req.data.redditUserName,
			mav = {
				title: ' Analytics for '+userName,
				pageState: '',
				user: req.user,
				username: userName,
				userId: userId,
				submissionDates: req.data.submissionDates,
				pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
				genderChart: JSON.stringify(req.data.countsByGender),
				wondertradeTrends: JSON.stringify(req.data.trendsByDate),
				levelBarChart: JSON.stringify(req.data.countsByLevels),
				pokemonTable: req.data.sortedCountsByPokemon,
				quickstats: req.data.quickstats,
				countryChart: JSON.stringify(req.data.sortedCountsByCountries),
				redditResults: false
			};

		// TODO: decrease page loads by moving this to clientside
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
	}
	function UserIdDatePage(req, res) {

		var userTable = req.userTable,
			userId = req.params.userId,
			userName = userTable[userId],
			submissionDate = req.params.submissionDate;

		res.render('data/userDate', {
			title: ' Analytics for '+userName,
			pageState: '',
			user: req.user,
			username: userName,
			submissionDate: submissionDate,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			genderChart: JSON.stringify(req.data.countsByGender),
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			pokemonTable: req.data.sortedCountsByPokemon,
			quickstats: req.data.quickstats,
			countryChart: JSON.stringify(req.data.sortedCountsByCountries)
		});
	}
	function GroupsPage(req, resp) {
		resp.render('data/groups', {
			title: 'Pokemon Data Sorted by Custom Groups',
			pageState: '',
			user: req.user
		});
	}
	function RenderGroupData(req, resp) {
		resp.render('data/groupsData', {
			title: req.data.pokemonGroupName,
			pageState: '',
			pokemonGroupArray: req.data.pokemonGroup,
			PokemonHash: PokemonHash,
			trendingPokemonChart: JSON.stringify(req.data.cachedTrendByPokemonIds),
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: req.data.sortedCountsByPokemon,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}
	function getVisualizeData(req, resp){
		resp.render('visualize', {
			title: 'Visualized Wonder Trades',
			pageState: '',
			pokemonIdList: req.data.randomSample
		});
	}
	function RecentWonderTradesPage(req, res) {
		res.render('wondertrade/index', {
			wondertrades: req.highChartsData.deserializedResults.slice(0, 100),
			title: 'Wonder Trade List',
			pokemonHash: PokemonHash,
			countryHash: CountryHash,
			pageState: '',
			userTable: req.userTable,
			user: req.user
		});
	}

	function renderPokeballPage(req, res) {

		req.highChartsData.getPokeballsData(function(err, result) {
			var sortedResult = Object.keys(result).map(function(key) {
				return [key, result[key], capitalize(key)];
			}).sort(function(current, next) {
				return (current[1] > next[1]) ? 1 : -1;
			});


			res.render('data/pokeballs/index', {
				title: 'Wonder Trade Pokeball Analytics',
				pageState: '',
				user: req.user,
				totalCount: req.resultSize,
				pokeballChart: JSON.stringify(sortedResult),
				sortedResult: sortedResult
			});
		});
	}

	function renderPokeballTypePage(req, res) {

		var pokeballType = (req.params.type) || '';
		var pokeballTypeCapitalized = capitalize(pokeballType);
		res.render('data/pokeballs/type', {
			title: 'Pokemon caught with a ' + pokeballTypeCapitalized,
			pokeballType: pokeballTypeCapitalized,
			pageState: '',
			PokemonHash: PokemonHash,
			levelBarChart: JSON.stringify(req.data.countsByLevels),
			countryChart: JSON.stringify(req.data.sortedCountsByCountries),
			pokemonList: PokemonList,
			user: req.user,
			pokemonTable: req.data.sortedCountsByPokemon,
			pokemonChart: JSON.stringify(req.data.sortedCountsByPokemon),
			quickstats: req.data.quickstats
		});
	}

	app.get('/data', setupHighChartsData, HighCharts.getSortedCountsByCountries, HighCharts.getSortedCountsByPokemon, OverviewPage);

	// Setup the highcharts Object before each /data/* request
	app.get('/data/*', setupHighChartsData);

	app.get('/data/pokemon', HighCharts.getTopPokemon, HighCharts.getCountsByLevels, HighCharts.getSortedCountsByCountries,
		HighCharts.getSortedCountsByPokemon, HighCharts.getQuickStats, HighCharts.setPokemonGroup, HighCharts.getCachedTrendByPokemonIds, PokemonPage);

	app.get('/data/pokemon/:pokemonId', HighCharts.setSubsetByPokemonId, HighCharts.getCountsByLevels,
		HighCharts.getNicknamesByResultSet, HighCharts.getSortedCountsByCountries, HighCharts.getCountsByGender,
		HighCharts.getCachedTrendByPokemonId, HighCharts.getQuickStats, PokemonByIdPage);

	app.get('/data/regions', HighCharts.getSortedCountsByCountries, RegionsPage);

	app.get('/data/regions/:regionCode', HighCharts.setSubsetByRegionId, HighCharts.getCountsByGender, HighCharts.getDataCountsSplitByTime,
		HighCharts.getSortedCountsByPokemon, HighCharts.getCountsBySubRegions, HighCharts.getQuickStats, RegionByIdPage);

	app.get('/data/hiddenAbilities', HighCharts.setSubsetByHiddenAbilities, HighCharts.getCountsByLevels,
		HighCharts.getSortedCountsByCountries, HighCharts.getSortedCountsByPokemon, HighCharts.getQuickStats, HiddenAbilitiesPage);

	app.get('/data/perfectIV', HighCharts.setSubsetByPerfectIV, HighCharts.getCountsByLevels,
		HighCharts.getSortedCountsByCountries, HighCharts.getSortedCountsByPokemon, HighCharts.getQuickStats, PerfectIVPage);

	app.get('/data/shiny', HighCharts.setSubsetByShinyPokemon, HighCharts.getCountsByLevels,
		HighCharts.getSortedCountsByCountries, HighCharts.getSortedCountsByPokemon, HighCharts.getQuickStats, ShinyPage);

	app.get('/data/gender', HighCharts.getGenderData, GenderPage);

	app.get('/data/levels', HighCharts.getCountsByLevels, LevelsPage);
	app.get('/data/levels/:pokemonLevel', HighCharts.setSubsetByPokemonLevel, HighCharts.getSortedCountsByPokemon,
		HighCharts.getSortedCountsByCountries, HighCharts.getQuickStats, HighCharts.getCountsByGender, LevelPage);
	app.get('/data/dates', HighCharts.getCachedQuickStatsTrendsByDates, DatesPage);
	app.get('/data/dates/:submissionDate', setupUserTableData, HighCharts.setSubsetBySubmissionDate,
		HighCharts.getSortedCountsByPokemon, HighCharts.getSortedCountsByCountries, HighCharts.getQuickStats,
		HighCharts.getCountsByUserIdAndUserTableFormatted, DatePage);

	app.get('/data/daterange/:startDate/:endDate', setupUserTableData, HighCharts.setSubsetByDateRange,
		HighCharts.getSortedCountsByPokemon, HighCharts.getSortedCountsByCountries, HighCharts.getCountsByGender,
		HighCharts.getCountsByUserIdAndUserTableFormatted,
		HighCharts.getQuickStats, DateRangePage);

	app.get('/data/likes', HighCharts.getCommunityLikes, LikesPage);
	app.get('/data/time', HighCharts.getDataSplitByTime, HighCharts.getQuickStatsTrendsByTime, TimePage);
	app.get('/data/recent', setupUserTableData, RecentWonderTradesPage);

	app.get('/data/pokeballs', renderPokeballPage);
	app.get('/data/pokeballs/:type',  HighCharts.setSubsetByPokeballType, HighCharts.getCountsByLevels,
			HighCharts.getSortedCountsByCountries, HighCharts.getSortedCountsByPokemon, HighCharts.getQuickStats, renderPokeballTypePage);

	app.get('/groups', GroupsPage);
	app.get('/groups/:groupName', setupHighChartsData, HighCharts.setPokemonGroup, HighCharts.setSubsetByPokemonGroup,
		HighCharts.getSortedCountsByPokemon, HighCharts.getCachedTrendByPokemonIds, HighCharts.getCountsByLevels,
		HighCharts.getQuickStats, RenderGroupData);

	app.get('/originalTrainers', OTPage);

	app.get('/users/*', setupHighChartsData, setupUserTableData);
	app.get('/users/:userId', findRedditUserName, HighCharts.setSubsetByUserId,
		HighCharts.getSortedCountsByPokemon, HighCharts.getSortedCountsByCountries, HighCharts.getCountsByGender,
		HighCharts.getSubmissionDates, HighCharts.getTrendsByDate, HighCharts.getCountsByLevels,
		HighCharts.getQuickStats, UserIdPage);
	app.get('/users/:userId/achievements', findRedditUserName, HighCharts.setSubsetByUserId, HighCharts.getAchievements);
	app.get('/users/:userId/date/:submissionDate', HighCharts.setSubsetByUserIdAndSubmissionDate,
		HighCharts.getSortedCountsByPokemon, HighCharts.getSortedCountsByCountries, HighCharts.getCountsByGender,
		HighCharts.getCountsByLevels, HighCharts.getQuickStats,
		UserIdDatePage);

	app.get('/visualize', setupHighChartsData, HighCharts.getRandomSample, getVisualizeData);
};
