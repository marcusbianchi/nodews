exports.rawdataServerRoute = function(router, configObject) {
	// Modelo de Máquinas para Validação
	var rawdataSchema = require('./model/rawdata');
	//Validador de Schemas
	var validate = require('jsonschema')
		.validate;
	//DBClient
	var dbClient = new require('../../Databaseaccess/DBClientFactory');
	router.route('/rawdata')
		.post(function(req, res) {
			var validation = validate(req.body, rawdataSchema);
			if (validation.errors.length === 0) {
				try {
					dbClient.create("s3", {
						"endpoint": configObject.rawdataapi.s3.endpoint,
						"bucket": configObject.rawdataapi.s3.rawbucket,
					}, req.body, function(error, saveFileID) {
						if (error) {
						res.send(400, error);
						} else {
							res.send(200, saveFileID);
						};
					});
				} catch (error) {
					res.send(500, error);
				}
			} else {
				var errors = [];
				validation.errors.forEach(function(element, index) {
					errors[index] = element.stack;
				});
				res.send(400, errors);
			}
		});
};