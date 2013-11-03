var express = require('express'),
	ejs = require('ejs'),
	engine = require('ejs-locals'),
	redis = require('redis'),
	dataStore = redis.createClient(),
	app = express();

app.engine('ejs', engine);
app.use(express.cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Init Home Controller
(require('./controllers/home')).initController(app, dataStore);

// Init WonderTrade Controller
(require('./controllers/wondertrade')).initController(app);


// app.get('/test/:newValue', function(req, res){
// 	var newValue = req.params.newValue;
// 	res.send('the test field should reflect "'+newValue+'"');
// 	dataStore.set('test', newValue);
// });

app.listen(3000, function(){
	console.log('Listening on port 3000.');
});