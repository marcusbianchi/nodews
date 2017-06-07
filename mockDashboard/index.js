var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json());

app.get('/api/', function(req, res) {
	fs.readdir(__dirname + "/database/", function(err, files){
		data = [];
		files.forEach(function(element){			
			data.push(JSON.parse(fs.readFileSync(__dirname + "/database/"+element).toString()));
		});
		console.log(data);
		res.end(JSON.stringify(data));
	})

	
})

app.get('/api/:id', function(req, res) {
	var itemId = req.params.id;
	fs.readFile(__dirname + "/database/" + itemId + ".json", 'utf8', function(err, data) {
		if (err)
			res.send(err);
		res.end(data);
	});
})

app.post('/api/', function(req, res) {
	fs.writeFile(__dirname + "/database/" + req.body.tileConfigId + ".json", JSON.stringify(req.body), function(err) {
		if (err) {
			return console.log(err);
		}
	});
	res.end(JSON.stringify(req.body));
})

app.put('/api/:id', function(req, res) {
	var itemId = req.params.id;
	fs.writeFile(__dirname + "/database/" + itemId + ".json", JSON.stringify(req.body), function(err) {
		if (err) {
			return console.log(err);
		}
	});
	res.end(JSON.stringify(req.body));
})



var server = app.listen(8081, function() {

	var host = server.address().address
	var port = server.address().port

	console.log("Example app listening at http://%s:%s", host, port)

})