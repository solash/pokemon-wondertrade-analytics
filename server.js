var express = require('express'),
	app = express();


app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.get('/', function(req, res){	
	res.send('Your last page was '+req.session.prevPage+'<br/>');	
});

app.get('/test1', function(req, res){
	res.send('test1, your session should reflect you visited test1 last');
	req.session.prevPage = 'test1';
});
app.get('/test2', function(req, res){
	res.send('test1, your session should reflect you visited test2 last');
	req.session.prevPage = 'test2';
});

app.listen(3000, function(){
	console.log('Listening on port 3000');
});