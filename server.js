var express = require('express'),
	util = require('util'),
	ejs = require('ejs'),
	engine = require('ejs-locals'),
	redis,
	dataStore,
	app = express();

if (process.env.REDISTOGO_URL) {	
	var redis = require('redis');
	var url = require('url');
	var redisURL = url.parse(process.env.REDISTOGO_URL);
	dataStore = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	dataStore.auth(redisURL.auth.split(":")[1]);

} else {	
	dataStore = require("redis").createClient();
}

app.engine('ejs', engine);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

Date.prototype.customFormatDate = function(){
	var year = this.getFullYear(),
		month = ('0'+(this.getMonth()+1)).slice(-2),
		day = ('0'+(this.getDate())).slice(-2);
	return [year, month, day].join('-');
};

// Init Home Controller
(require('./controllers/home')).initController(app, dataStore);

// Init WonderTrade Controller
(require('./controllers/wondertrade')).initController(app, dataStore, util);

// Init Data Controller
(require('./controllers/data')).initController(app, dataStore);

// app.get('/test/:newValue', function(req, res){
// 	var newValue = req.params.newValue;
// 	res.send('the test field should reflect "'+newValue+'"');
// 	dataStore.set('test', newValue);
// });

app.listen(3000, function(){
	console.log('Listening on port 3000..');
});