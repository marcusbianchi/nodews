var request = require('request');
var jsonfile = require('jsonfile')
var fs = require('fs');


function saveDashboard(obj, DashboardId) {
	var outString = obj.name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

    var file = './temp/' + DashboardId + "-"+outString+'.json'
    jsonfile.writeFile(file, obj, {
        flag: "a"
    }, function(err) {
        if(err){
            console.error(err)
        }
    });
}

function readDashboard(DashboardId) {
    request('http://servti:8044/api/Dashboard/' + DashboardId, function(error, response, body) {
        if (!error) {
            console.log(response.statusCode);
            saveDashboard(JSON.parse(body), DashboardId);
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
readallDashboard();
