var UserModel = require('../models/User'),
	RedditUser = require('../models/RedditUser'),
	UserTableModel = require('../models/UserTable'),
	HighChartsData = require('../models/HighChartsData');

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

module.exports = function(app, dataStore, passport, LocalStrategy) {

	// Take the user to the login page.
	app.get('/login', function(request, response){
		response.render('auth/login', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			user: request.user
		});
	});

	// Handle user logout request
	app.get('/logout', function(request, response){
		request.logout();
		response.redirect('/');
	});

	// Handle User login request
	app.post('/login', passport.authenticate('local'), function(request, response) {
		// If we made it here, authentication was successful.
		var newUser = request.user;
		response.redirect('/help');
	});

	// So... I need to make a register page.
	app.get('/register', function(request, response){
		if(!request.user) {
			response.render('auth/register', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				user: request.user
			});
		} else {
			response.redirect('/help');
		}

	});


	app.post('/register', function(request, response, next){
		var username = request.body.username,
			password = request.body.password;
		if(username && password) {
			dataStore.lrange('userTable' , 0, -1, function(error, result) {

				var userTableSize = result.length,
					alreadyExists = false,
					newestUserId;

				if(userTableSize > 0) {
					newestUserId = JSON.parse(result[0]).id;
				} else {
					newestUserId = 0;
				}

				for(var user in result) {
					var currentUser = JSON.parse(result[user]);
					if(currentUser.username === username) {
						alreadyExists = true;
					}
				}
				if(alreadyExists) {
					return response.redirect('/help');
				} else {
					var newUser = new UserModel({username: username, password: password.hashCode(), id:(parseInt(newestUserId)+1)});
					dataStore.lpush('userTable', JSON.stringify(newUser));
					console.log("New user "+username+" was added");
					request.login(newUser, function(err) {
						if (err) { return next(err); }
						return response.redirect('/help');
					});
				}
			});
		} else {
			return response.redirect('/register');
		}
	});

	// Dashboard
	app.get('/dashboard', function(request, response){
		if(request.user) {

			dataStore.lrange('userTable' , 0, -1, function(error, result){
				var userTable = new UserTableModel(result);

				dataStore.lrange('redditUser' ,0, -1, function(error, result){
					var userId = request.user.id,
						redditUserName = '';
					for(var redditUser in result) {
						var parsedRedditUser = JSON.parse(result[redditUser]);
						if(parsedRedditUser.userId === userId) {
							redditUserName = parsedRedditUser.redditUserName;
						}
					}
					response.render('auth/dashboard', {
						title: 'Wonder Trade Analytics',
						pageState: '',
						user: request.user,
						redditUserName: redditUserName
					});
				});
			});
		} else {
			response.redirect('/login');
		}
	});

	// Update User Reddit Name
	app.post('/user/updateReddit', function(request, response){
		if (request.user) {
			var userId = request.user.id,
				redditUserName = request.body.redditUsername,
				redditUser = new RedditUser({userId: userId, redditUserName: redditUserName});

			dataStore.lrange('redditUser' , 0, -1, function(error, result){
				for(var user in result) {
					tempUser = JSON.parse(result[user]);
					if(tempUser.userId == userId) {
						dataStore.lrem('redditUser', 0, result[user]);
					}
				}
				dataStore.lpush('redditUser', JSON.stringify(redditUser));
				response.redirect('/dashboard');

			});
		} else {
			response.redirect('/login');
		}
	});

	// Add a Link to WonderTrade Date
	app.post('/wondertrade/link', function(request, response){

	});

	passport.use(new LocalStrategy(
		function(username, password, done) {
			dataStore.lrange('userTable' , 0, -1, function(error, result) {
				for(var user in result) {
					var currentUser = JSON.parse(result[user]);
					if(currentUser.username && currentUser.password) {
						if(currentUser.username == username && currentUser.password == password.hashCode()) {
							return done(null, currentUser);
						} else if (currentUser.username == username) {
							return done(null, false, { message: 'Incorrect password.' });
						}
					}
				}
				return done(null, false, { message: 'Incorrect username.' });
			});
		}
	));


	//serialize by user id
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		dataStore.lrange('userTable' , 0, -1, function(error, result){
			for(var user in result) {
				var currentUser = JSON.parse(result[user]);
				if(currentUser.id == id) {
					done(null, currentUser);
				}
			}
		});
	});
};