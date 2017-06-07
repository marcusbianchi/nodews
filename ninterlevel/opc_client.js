"use strict";
/*global require,console,setTimeout */
var opcua = require("node-opcua");
var async = require("async");


/*var options = {
	certificateFile: "cert_pem.pem",
	privateKeyFile: "privatekey_pem.pem"
}*/

var client = new opcua.OPCUAClient();
var endpoint = 'opc.tcp://192.168.9.17:49320';

var the_session, the_subscription;


console.log('Incializando');
client.findServers({
	endpointUrl: endpoint
}, function(err, res) {
	console.log(res);
	console.log(err);
});

/*async.series([
	function(callback) {
		client.connect(endpoint, function(err) {
			console.log('Conectando');
			if (err) {
				console.log("cannot connect to endpoint :", endpoint);
			} else {
				console.log("connected !");
			}
			console.log('Conectado');
			callback(err);
		});
	},
	function(callback) {
		client.createSession(function(err, session) {
			if (!err) {
				the_session = session;
			}
			callback(err);
		});
	},
	function(callback) {
		the_session.browse("RootFolder", function(err, browse_result) {
			if (!err) {
				browse_result[0].references.forEach(function(reference) {
					console.log(reference.browseName.toString());
				});
			}
			callback(err);
		});
	},
	function(callback) {
		the_session.close(function(err) {
			if (err) {
				console.log("session closed failed ?");
			}
			callback();
		});
	}

]);*/