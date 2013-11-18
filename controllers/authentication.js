exports.initController = function(app, dataStore, passport, LocalStrategy) {

	// http://danialk.github.io/blog/2013/02/23/authentication-using-passportjs/
	// http://stackoverflow.com/questions/15627358/node-js-express-using-passport-with-redis-getting-session-unauthorized

	app.get('/login', function(request, response){
		console.log(request.user);
		response.render('auth/login', {
			title: 'Wonder Trade Analytics',
			pageState: ''		
		});
	});

	app.post('/login', passport.authenticate('local'), function(request, response) {
		var newUser = request.user;
		dataStore.lpush('userTable', JSON.stringify(newUser));	
		// If this function gets called, authentication was successful.
		// `req.user` contains the authenticated user.
		response.redirect('/users/' + newUser.id);
	});

	app.get('/users', function(request, response){		
		dataStore.lrange('userTable' , 0, -1, function(error, result){			

			var userTable = result;
			console.log(userTable);

			response.render('auth/userTable', {
				title: 'Wonder Trade Analytics',
				pageState: '',
				userTable: userTable		
			});
		});

	});

	app.get('/users/:id', function(request, response){
		response.render('auth/user', {
			title: 'Wonder Trade Analytics',
			pageState: ''		
		});
	});

	passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' },
	    function(email, password, done) {
	        //find user in database here
	        var user = {id: 1, username:'test', password:'pass'};
	        return done(null, user);
	    }
	));

	passport.serializeUser(function(user, done) {
	    //serialize by user id
	    done(null, user.id)
	});

	passport.deserializeUser(function(id, done) {
	    //find user in database again
	    var user = {id: 1, username:'test', password:'pass'};
	    done(null, user);
	});
}