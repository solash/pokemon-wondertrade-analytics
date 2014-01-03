var _ = require('underscore'),
    rest = require('restler'),
    parseString = require('xml2js').parseString,
	HighChartsData = require('../models/HighChartsData').model,
	PokemonList = require('../data/pokemonList.json'),
	CountryList = require('../data/countryList.json'),
	UserTableModel = require('../models/UserTable').model,
    RedditPostModel = require('../models/RedditPost').model,
	PokemonHash = {},
	CountryHash = {};

for(var pokemon in PokemonList) {
		PokemonHash[PokemonList[pokemon].id] = PokemonList[pokemon].name;
	}

for(var country in CountryList) {
	CountryHash[CountryList[country].id] = CountryList[country].name;
}



exports.initController = function(app, dataStore) {

    function setupHighChartsData(req, resp, next){
        dataStore.lrange('wondertrade' ,0, -1, function(error, result){
            req.highChartsData = new HighChartsData(result);
            req.result= result;

            next();
        });
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
            topTenPokemonIds = _.map(topTenPokemon, function(pkmn){return pkmn[0]});

        pokemonTable.reverse();

        resp.render('data/pokemon', {
            title: 'Wonder Trade Pokemon Analytics',
            pageState: '',
            result: req.result,
            PokemonHash: PokemonHash,
            trendingPokemonChart: JSON.stringify(highChartsData.getCountTrendsByPokemon(false, topTenPokemonIds)),
            levelBarChart: JSON.stringify(highChartsData.getCountsByLevels()),
            topTenPokemon: topTenPokemon,
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
            regionName = CountryHash[regionId];

        resp.render('data/regionById', {
            title: regionName+' Analytics',
            pageState: '',
            regionName: regionName,
            genderChart: JSON.stringify(highChartsData.getCountsByGender(highChartsDataByRegionId)),
            pokemonChart: JSON.stringify(highChartsData.getSortedCountsByPokemon(highChartsDataByRegionId)),
            subregionChart: JSON.stringify(highChartsData.getCountsBySubRegions(highChartsDataByRegionId)),
            quickstats: highChartsData.getQuickStats(highChartsDataByRegionId),
            user: req.user
        });
    }

    function NicknamesPage(req, resp){

        dataStore.lrange('userTable' , 0, -1, function(error, result){
            var userTable = new UserTableModel(result);

            dataStore.lrange('wondertrade' ,0, -1, function(error, result){
                var highChartsData = new HighChartsData(result),
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
                    pokemonTable: pokemonTable,
                    quickstats: highChartsData.getQuickStats(highChartsDataByUserId),
                    countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByUserId)),
                    redditResults: false
                };

                if (redditUserName && redditUserName != '') {
                    rest.get('http://www.reddit.com/r/WonderTrade/search.rss?q=subreddit%3Awondertrade+author%3A'+redditUserName).on('complete', function(data) {
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
                pokemonTable: pokemonTable,
                quickstats: highChartsData.getQuickStats(highChartsDataByUserId),
                countryChart: JSON.stringify(highChartsData.getSortedCountsByCountries(highChartsDataByUserId))
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
	app.get('/data/gender', GenderPage);
	app.get('/data/levels', LevelsPage);
	app.get('/data/levels/:pokemonLevel', LevelPage);
	app.get('/data/dates', DatesPage);
	app.get('/data/dates/:submissionDate', DatePage);
    app.get('/data/likes', LikesPage);

    // TODO: setupUserTableData, and consider moving this to a separate controller?
    app.get('/users/*', setupHighChartsData);
	app.get('/users/:userId', UserIdPage);
	app.get('/users/:userId/date/:submissionDate', UserIdDatePage);

};
