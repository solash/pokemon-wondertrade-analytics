var express = require('express'),
	RedisStore = require('connect-redis')(express),
	app = express();


app.use(express.cookieParser());


app.get('/', function(req, res){	
	res.send('hello world');
});

app.get('/test1', function(req, res){
	res.send('test1, your session should reflect you visited test1 last');
});
app.get('/test2', function(req, res){
	res.send('test1, your session should reflect you visited test2 last');
});

app.listen(3000, function(){
	console.log('Listening on port 3000');
	console.log(RedisStore);
});