if(process.env.NODE_ENV !== 'DEVELOPMENT') {
	require('newrelic');
}

var express = require('express'),
	ejs = require('ejs'),
	engine = require('ejs-locals'),
	app = express(),
	passport = require("passport"),
	LocalStrategy = require('passport-local').Strategy,
	RedisStore = require('connect-redis')(express),
    MemoryStoreModel = require("./models/MemoryStore"),
	redisEnvUrl = process.env.REDISCLOUD_URL,
	REFRESH_CHARTS_RATE = 1800000, // 30 minutes
    MemoryStore,
	dataStore;

process.env.TZ = 'America/Chicago';
process.setMaxListeners(0);

// If REDISCLOUD_URL is available (Heroku box)
if (redisEnvUrl) {
	var redis = require('redis');
	var url = require('url');
	var redisURL = url.parse(redisEnvUrl);
	dataStore = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	dataStore.auth(redisURL.auth.split(":")[1]);
} else {	
	dataStore = require("redis").createClient();
}

MemoryStore = new MemoryStoreModel(dataStore);
MemoryStore.refreshHighCharts();
setInterval(function(){
    MemoryStore.refreshHighCharts();
}, REFRESH_CHARTS_RATE);

app.configure(function() {
	app.engine('ejs', engine);
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
	app.use(express.session({ secret: 'keyboard cat times eleven',store: new RedisStore() }));
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
(require('./controllers/home'))(app, dataStore, MemoryStore);

// Init WonderTrade Controller
(require('./controllers/wondertrade'))(app, dataStore, passport, MemoryStore);

// Init Data Controller
(require('./controllers/data'))(app, dataStore, MemoryStore);

// Init User Authentication Controller
(require('./controllers/authentication'))(app, dataStore, passport, LocalStrategy);

// Init Admin Controller
(require('./controllers/admin'))(app, dataStore);


// After all other routes are init, we can now check for 404s.
app.use(function(req, res, next){  
  res.render('404', { status: 404, url: req.url, title: 'Page Not Found', user: req.user, stateMessage: '', pageState: '' });
});


var serverPort = process.env.PORT || 5000;
app.listen(serverPort, function(){
	console.log('Listening on port '+serverPort+'..');
});