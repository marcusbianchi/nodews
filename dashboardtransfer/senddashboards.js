var request = require('request');
var jsonfile = require('jsonfile')
var fs = require('fs');

var dashboarlist=[];
var totallength = 0;

function postDashboad() {
	
	if(dashboarlist.length!==0){
		var obj = dashboarlist.pop();
		var DashboardId = obj.dashboardConfigId
		console.log("Processando "+ DashboardId);
	

    request.post({
        url: 'http://localhost:8044/api/Dashboard/',
        json: obj,
        timeout: 50000
    }, function(error, response, body) {
		if(error)
		{
			console.log(error+" para "+ DashboardId);
		}
		else{
        console.log(response.statusCode+" para "+ DashboardId);
		}
		postDashboad();
    });
	}
}

function processFile(DashboardId) {
	
    var file = './temp/' + DashboardId;
    jsonfile.readFile(file, function(err, obj) {
    	//console.log(obj);
		console.log("Lendo "+ DashboardId);

		dashboarlist.push(obj);
		if(dashboarlist.length===totallength){
			postDashboad(obj);
		}

        //
    });
}

function processAllFiles() {
    fs.readdir('./temp/', function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
		totallength = filenames.length;
        for (var i = filenames.length - 1; i >= 0; i--) {
        	processFile(filenames[i]);
        }
    })
}
processAllFiles();
