// call the packages we need

var fs = require('fs');
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var machineserver = require('./apps/machinerest/machineserver');
var rawdataserver = require('./apps/rawdatarest/rawdataserver')

//locading configoption to object
var configObject = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8082; // set our port

var router = express.Router(); // get an instance of the express Route

//==============================================================================
//Setup the Machine API: Pass Router and configObject
//==============================================================================
machineserver.machineServerRoute(router, configObject);
rawdataserver.rawdataServerRoute(router, configObject);

app.use('/', router);
console.log('Server Online');
app.listen(port);
module.exports = app;