var express = require('express'),
	ejs = require('ejs'),
	engine = require('ejs-locals'),
	app = express(),
	passport = require("passport"),
	LocalStrategy = require('passport-local').Strategy,
	redis,
	dataStore;

process.env.TZ = 'America/Chicago';

// If REDIS_TOGO is available (Heroku box)
if (process.env.REDISTOGO_URL) {
	var redis = require('redis');
	var url = require('url');
	var redisURL = url.parse(process.env.REDISTOGO_URL);
	dataStore = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	dataStore.auth(redisURL.auth.split(":")[1]);
} else {	
	dataStore = require("redis").createClient();
}

app.configure(function() {
	app.engine('ejs', engine);
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
	app.use(express.session({ secret: 'keyboard cat times eleven' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + '/public'));
});


Date.prototype.customFormatDate = function(){
	var year = this.getFullYear(),
		month = ('0'+(this.getMonth()+1)).slice(-2),
		day = ('0'+(this.getDate())).slice(-2);
	return [year, month, day].join('-');
};

// Init Home Controller
(require('./controllers/home')).initController(app, dataStore);

// Init WonderTrade Controller
(require('./controllers/wondertrade')).initController(app, dataStore, passport);

// Init Data Controller
(require('./controllers/data')).initController(app, dataStore);

// Init User Authentication Controller
(require('./controllers/authentication')).initController(app, dataStore, passport, LocalStrategy);

// Init Admin Controller
(require('./controllers/admin')).initController(app, dataStore);


// After all other routes are init, we can now check for 404s.
app.use(function(req, res, next){  
  res.render('404', { status: 404, url: req.url, title: 'Page Not Found', user: req.user, stateMessage: '', pageState: '' });
});


var serverPort = process.env.PORT || 5000;
app.listen(serverPort, function(){
	console.log('Listening on port '+serverPort+'..');
});