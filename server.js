var express = require('express'),
	app = express();


app.listen(3000);
console.log('Listening on port 3000');

app.get('/', function(req, res){
  res.send('This is a node generated homepage');
});