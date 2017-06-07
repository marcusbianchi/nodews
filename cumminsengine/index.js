"use strict";

var request = require("request");
var async = require("async")
var JSONPath = require('jsonpath-plus');

var dashboard_config_url = 'http://servti:8044/api/dashboard'
var serverLoc = 'http://servti:'

request(dashboard_config_url, function(error, response, body) {
    var things_funcs = [];
    var jsonbody = JSON.parse(body);
    async.map(jsonbody, generate_dashboard, function(err, results) {
        console.log('done');
    })
});

function generate_dashboard(dashboard, callback) {
    request.get(dashboard_config_url + '/' + dashboard_config['dashboardConfigId'], function(error, response, body) {
        var jsonbody = JSON.parse(body);
        var dashboard_show = {};
        dashboard_show['dashboardConfigId'] = jsonbody['dashboardConfigId'];
        dashboard_show['systemEndpointId'] = jsonbody['systemEndpointId'];
        dashboard_show['refreshRate'] = jsonbody['refreshRate'];
        dashboard_show['gutter'] = jsonbody['gutter'];
        dashboard_show['numberOfColumns'] = jsonbody['numberOfColumns'];
        dashboard_show['dashboardHeader'] = jsonbody['dashboardHeader'];
        dashboard_show['tileRatio'] = jsonbody['tileRatio'];
        dashboard_show['hasAxis'] = jsonbody['hasAxis'];
        dashboard_show['tileConfigId'] = jsonbody['tileConfigId'];
        var tiles = jsonbody['tiles'];
        if (tiles) {
            async.parallel(tiles, generate_tile, function(err, results) {
                if (err) {
                    callback(err, null)
                }
                callback('error', null);
            })
        } else {
            callback(null, '');
        }
    });
}

function generate_tile(tile, callback) {
    var tile_show = {};
    tile_show['tileId'] = tile_config['tileId'];
    tile_show['show'] = tile_config['show'];
    tile_show['tileWidth'] = tile_config['tileWidth'];
    tile_show['tileHeight'] = tile_config['tileHeight'];
    tile_show['detailsLink'] = tile_config['detailsLink'];
    tile_show['textProperties'] = tile_config['textProperties'];
    if (tile_config['tileType'] === 'tile') {
        if (tile_config['fixedValueCommon']) {
            tile_show[''] = tile_config['fixedValueCommon'] + ' ' + tile_config['fixedValueUnique'];
        } else if (tile_config['tileContentType']) {
            tile_show['tileContentType'] = tile_config['tileContentType']
            tile_show['rail'] = tile_config['rail'];
        } else if (tile_config['emphasysSource'] != null || tile_config['dataSource'] != null || tile_config['colorSource'] != null) {
            var get_task = []
            if (tile_config['emphasysSource'] != null) {
                get_task.push(tile_config['emphasysSource']);
            }
            if (tile_config['dataSource'] != null) {
                get_task.push(tile_config['dataSource']);
            }
            if (tile_config['colorSource'] != null) {
                get_task.push(tile_config['colorSource']);
            }        }
        callback(null, '');

    } else {
        //datagrid
        callback(null, '');

    }


}

function getDataSource(tile_config, callback) {

    var url = serverLoc + tile_config['dataSource']['url'] + `?`;

    var queryparams = tile_config['dataSource']['queryParameters']
    for (var i = queryparams.length - 1; i >= 0; i--) {
        url += queryparams[i].param + '=' + queryparams[i].value
        if (i !== 0)
            url += '&';
    }
    request.get(url, function(error, response, body) {
        var obj = JSON.parse(body);
        if (error) {
            callback(error, null);
        }
        console.log(response.statusCode)
        var path = "$." + tile_config['dataSource']['path'];
        var result = JSONPath({ json: obj, path: path });
        callback(null, result[0]);
    });

}

function getColorSource(tile_config, callback) {

    var url = serverLoc + tile_config['colorSource']['url'] + `?`;
    var queryparams = tile_config['colorSource']['queryParameters']
    for (var i = queryparams.length - 1; i >= 0; i--) {
        url += queryparams[i].param + '=' + queryparams[i].value
        if (i !== 0)
            url += '&';
    }
    request.get(url, function(error, response, body) {
        var obj = JSON.parse(body);
        if (error) {
            callback('error', null);
        }
        console.log(response.statusCode)
        var path = "$." + tile_config['dataSource']['path'];
        var result = JSONPath({ json: obj, path: path });
        callback(null, result[0]);
    })

}

function getEmphasysSource(tile_config, callback) {

    var url = serverLoc + tile_config['colorSource']['url'] + `?`;
    var queryparams = tile_config['colorSource']['queryParameters']
    for (var i = queryparams.length - 1; i >= 0; i--) {
        url += queryparams[i].param + '=' + queryparams[i].value
        if (i !== 0)
            url += '&';
    }

    request.get(url, function(error, response, body) {
        var obj = JSON.parse(body);
        if (error) {
            callback(error, null);
        }
        console.log(response.statusCode)
        var path = "$." + tile_config['dataSource']['path'];
        var result = JSONPath({ json: obj, path: path });
        if (result.length != 0)
            callback(null, true);
        else
            callback(null, false);
    });


}
