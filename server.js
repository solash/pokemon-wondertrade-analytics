var express = require('express'),
	redis = require('redis'),
	dataStore = redis.createClient(),
	app = express();


app.use(express.cookieParser());


app.get('/', function(req, res){	
	res.send('hello world');
	dataStore.get('test', function(err, msg) {
		console.log(msg);
	});
});

app.get('/test/:newValue', function(req, res){
	var newValue = req.params.newValue;
	res.send('the test field should reflect "'+newValue+'"');
	dataStore.set('test', newValue);
});

app.listen(3000, function(){
	console.log('Listening on port 3000');
});