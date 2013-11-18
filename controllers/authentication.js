var UserModel = require('../models/User').model;

exports.initController = function(app, dataStore, passport, LocalStrategy) {

	// http://danialk.github.io/blog/2013/02/23/authentication-using-passportjs/
	// http://stackoverflow.com/questions/15627358/node-js-express-using-passport-with-redis-getting-session-unauthorized

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
		response.redirect('/users/' + newUser.id);
	});

	// List all the users.
	app.get('/users', function(request, response){		
		dataStore.lrange('userTable' , 0, -1, function(error, result){			

			var userTable = [];
			for(var user in result) {
				var parsedUser = JSON.parse(result[user]);
				userTable.push({username: parsedUser.username, count: 0});
			}
			
			response.render('auth/userTable', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				userTable: userTable,
				user: request.user
			});
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
		response.render('auth/register', {
			title: 'Wonder Trade Analytics',
			pageState: '',
			user: request.user
		});
	});

	app.post('/register', function(request, response, next){
		var username = request.body.username,
			password = request.body.password;
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
				response.redirect('/');
			} else {
				var newUser = new UserModel({username: username, password: password, id:(userTableSize+1)});
				dataStore.lpush('userTable', JSON.stringify(newUser));
				console.log("A new user was added");
				request.login(newUser, function(err) {
				  if (err) { return next(err); }
				  return response.redirect('/users/' + newUser.id);
				});
			}			
		});
		console.log(request.body);
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

	

	passport.serializeUser(function(user, done) {
	    //serialize by user id
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
}