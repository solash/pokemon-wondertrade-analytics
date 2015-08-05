var HighCharts = require('./highCharts'),
	UserTableModel = require('../models/UserTable');

module.exports = function(app, dataStore, MemoryStore) {
	var _ = require('underscore'),
		formatNumber = function(number, n,x) {

			if(!number){
				return 0;
			}

			// http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
			var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
			return number.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
		};

	function setupHighChartsData(req, resp, next){

		req.highChartsData = MemoryStore.store.highChartsData;
		req.data = {};
		next();
	}

	function setupUserTableData(req, res, next) {

		dataStore.lrange('userTable' , 0, -1, function(error, result){
			req.userTable = new UserTableModel(result);
			next();
		});
	}


	app.get('/', setupHighChartsData, HighCharts.getCachedTrendsByDate, function(req, res){

		var totalCount = MemoryStore.store.highChartsSize,
			formattedCount = formatNumber(totalCount, 0, 3);

		res.render('home', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			user: req.user,
			stateMessage: '',
			wondertradeTrends: JSON.stringify(req.data.cachedTrendsByDate),
			wondertradeCount: formattedCount
		});

	});

	app.get('/about', function(req, res){

		res.render('about', {
			title: 'About this Project',
			pageState: '',
			user: req.user
		});
	});

	app.get('/contributors', setupHighChartsData, setupUserTableData, HighCharts.getCountsByUserIdAndUserTableFormatted, function(req, res){

		dataStore.lrange('redditUser' , 0, -1, function(error, result){
			var redditUsers = {};
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				redditUsers[parsedUser.userId] = {redditUserName: parsedUser.redditUserName};
			}

			var userTableWithCounts = req.data.countsByUserIdAndUserTableFormatted;

			res.render('contributors', {
				title: 'Project Contributors',
				pageState: '',
				user: req.user,
				userTable: userTableWithCounts,
				redditUsers: redditUsers
			});

		});
	});

	app.get('/contest', function(req, resp){
		resp.redirect('/');
	});

	app.get('/help', function(request, response){
		response.render('help', {
			title: 'Wonder Trade Contributors',
			pageState: '',
			user: request.user
		});
	});

	app.get('/faq', function(request, response){
		response.render('faq', {
			title: 'Frequently Asked Questions',
			pageState: '',
			user: request.user
		});
	});

	app.get('/updates', function(request, response){
		response.render('updates', {
			title: 'Updates',
			pageState: '',
			user: request.user
		});
	});
};
