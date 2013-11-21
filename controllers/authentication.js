var UserModel = require('../models/User').model;

exports.initController = function(app, dataStore, passport, LocalStrategy) {

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
		response.redirect('/contributer');
	});

	app.get('/contributer', function(request, response){		
		response.render('auth/contributer', {
			title: 'Wonder Trade Analytics',
			pageState: '',			
			user: request.user
		});
	});

	// Show the individual user page.
	app.get('/users/:id', function(request, response){
		response.render('auth/user', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			user: request.user
		});
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
			response.redirect('/contributer');
		}
		
	});

	app.post('/register', function(request, response, next){
		var username = request.body.username,
			password = request.body.password;
		if(username && password) {
			dataStore.lrange('userTable' , 0, -1, function(error, result) {
				var userTableSize = result.length,
					alreadyExists = false;

				for(var user in result) {
					var currentUser = JSON.parse(result[user]);
					if(currentUser.username === username) {
						alreadyExists = true;
					}
				}
				if(alreadyExists) {
					response.redirect('/contributer');
				} else {
					var newUser = new UserModel({username: username, password: password, id:(userTableSize+1)});
					dataStore.lpush('userTable', JSON.stringify(newUser));
					console.log("A new user was added");
					request.login(newUser, function(err) {
					  if (err) { return next(err); }
					  return response.redirect('/contributer');
					});
				}			
			});	
		} else {
			return response.redirect('/register');
		}		
	});

	passport.use(new LocalStrategy(
		function(username, password, done) {
			dataStore.lrange('userTable' , 0, -1, function(error, result) {
				for(var user in result) {
					var currentUser = JSON.parse(result[user]);
					if(currentUser.username && currentUser.password) {						
						if(currentUser.username == username && currentUser.password == password) {
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
	    done(null, user.id)
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


	// Admin Related Stuff.
	app.get('/operationCleanSlate', function(request, response){
		var currentUser = request.user;
		if(currentUser && currentUser.username == "TheIronDeveloper") {
			dataStore.del('userTable');		
			dataStore.del('wondertrade');
			response.send('Operation Clean Slate');
		}		
	});
	
	app.get('/purge/users/:userId', function(request, response){
		//dataStore.del('wondertrade');		
		var userId = request.params.userId,
			currentUser = request.user,
			tempUser,
			deleteUser;

		// Cheap, I know... I need to implement an admin/mod/user system at some point.		
		if(currentUser && currentUser.username == "TheIronDeveloper") {
			console.log('Removing User ID: '+userId);
			dataStore.lrange('userTable' , 0, -1, function(error, result){
				for(var user in result) {
					tempUser = JSON.parse(result[user]);
					if(tempUser.id == userId) {					
						dataStore.lrem('userTable', 0, result[user]);
						console.log('Removed: ');
						console.log(result[user]);
					}
				}

				dataStore.lrange('wondertrade' , 0, -1, function(error, result){
					for(var wondertrade in result) {
						tempWondertrade = JSON.parse(result[wondertrade]);
						if(tempWondertrade.userId == userId) {											
							dataStore.lrem('wondertrade', 0, result[wondertrade]);				
							console.log('Removed: ');
							console.log(result[wondertrade]);
						}
					}
				});
				
				response.send('Alright, '+userId+' has officially been removed!');
				
			});	
		} else {
			response.send('Forbidden.');
		}
	});
}