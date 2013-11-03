var express = require('express'),
	ejs = require('ejs'),
	redis = require('redis'),
	dataStore = redis.createClient(),
	app = express();


app.use(express.cookieParser());
app.set('view engine', 'ejs');


app.get('/', function(request, response){	
	response.render('../views/home.ejs', {
		date: new Date()
	});
	dataStore.get('test', function(err, msg) {
		console.log(msg);
	});
});

app.get('/wondertrade', function(request, response){
	response.render('../views/wondertrade/index.ejs', {
		date: new Date()
	});
});

app.get('/wondertrade/new', function(request, response){
	response.render('../views/wondertrade/new.ejs', {});
});

app.get('/wondertrade/:id', function(request, response){
	var wondertrade_id = request.params.id;
	response.render('../views/wondertrade/show.ejs', {id:wondertrade_id});
});

app.post('/wondertrade/:id', function(request, response){
	var wondertrade_id = request.params.id;
	// code to save to datastore here
	response.render('../views/wondertrade/show.ejs', {id:wondertrade_id});
});

// app.get('/test/:newValue', function(req, res){
// 	var newValue = req.params.newValue;
// 	res.send('the test field should reflect "'+newValue+'"');
// 	dataStore.set('test', newValue);
// });

app.listen(3000, function(){
	console.log('Listening on port 3000.');
});