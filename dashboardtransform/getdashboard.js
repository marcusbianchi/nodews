var request = require('request');
var jsonfile = require('jsonfile')
var fs = require('fs');
var requestsync = require('sync-request');


function saveDashboard
(obj, DashboardId) {

    var outString = obj.code;
	console.log(outString);
    var file = './temp/' + DashboardId + "-" + outString + '.json'
    jsonfile.writeFile(file, obj, {
        flag: "a"
    }, function(err) {
        if (err) {
            console.error(err)
        }
    });
}

function readDashboard(DashboardId) {
    request('http://servti:8044/api/Dashboard/' + DashboardId, function(error, response, body) {
        if (!error) {
            console.log(response.statusCode);
            var obj = JSON.parse(body);
            obj.name  = obj.name.replace("Ú", 'U');
            obj.name  = obj.name.replace("ç", 'c');
            obj.name  = obj.name.replace(/[^a-zA-Z0-9 ]/g, '');
            obj.code  = obj.name.toLowerCase();
            obj.code = obj.code.split(' ').join('_');
            console.log(obj.code);
            saveDashboard(obj, DashboardId);
        }
    });
}

function readallDashboard(DashboardId) {
    request('http://servti:8044/api/Dashboard/', function(error, response, body) {
        if (!error) {
            var result = JSON.parse(body);
            for (var i = result.length - 1; i >= 0; i--) {
                readDashboard(result[i].dashboardConfigId);
            }
        }
    });
}

function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {

    for (var i = 0; i < arraytosearch.length; i++) {

        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
}


readallDashboard();
