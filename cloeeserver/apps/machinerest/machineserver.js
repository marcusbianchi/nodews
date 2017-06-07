exports.machineServerRoute = function(router, configObject) {
	// Modelo de Máquinas para Validação
	var machineSchema = require('./model/machineSchema');
	//Validador de Schemas
	var validate = require('jsonschema')
		.validate;
	//DBClient
	var dbClient = new require('../../Databaseaccess/DBClientFactory');

	var checkEmpty = function(machineObject) {
		var keys = Object.keys(machineObject);
		for (var i = 0; i < keys.length; i++) {
			var val = machineObject[keys[i]];
			if (val.hasOwnProperty('length')) {
				if (val.length === 0) {
					return true;
				}
			}
			if (typeof(val) == "object") {
				if (checkEmpty(val)) {
					return true;
				}
			}
		}
		return false;
	};

	router.route('/machines')
		.post(function(req, res) {
			var validation = validate(req.body, machineSchema);
			if (req.body.equipmentID) {
				res.status(400)
					.send("Machine Create Should not have EquipmentID");
			} else if (checkEmpty(req.body)) {
				res.status(400)
					.send("Machine can not contain empty values");
			} else if (validation.errors.length === 0) {
				try {
					dbClient.create("dynamo", {
						"region": configObject.machineApi.dynamo.region,
						"endpoint": configObject.machineApi.dynamo.endpoint,
						"table": configObject.machineApi.dynamo.table,
						"primaryKeys": configObject.machineApi.dynamo.primaryKeys
					}, req.body, function(error, machineJson) {
						if (error) {
							res.status(400)
								.send(error);
						} else {
							res.status(200)
								.send(machineJson);
						}
					});
				} catch (error) {
					res.status(500)
						.send(error);
				}
			} else {
				var errors = [];
				validation.errors.forEach(function(element, index) {
					errors[index] = element.stack;
				});
				res.send(400, errors);
			}

		});

	router.route('/machines/:companyid')
		.get(function(req, res) {
			try {


				dbClient.readAll("dynamo", {
					"region": configObject.machineApi.dynamo.region,
					"endpoint": configObject.machineApi.dynamo.endpoint,
					"table": configObject.machineApi.dynamo.table,
					"primaryKeys": configObject.machineApi.dynamo.primaryKeys
				}, req.params.companyid, function(error, machineJson) {

					if (error) {
						res.status(400)
							.send(error);
					} else {
						res.status(200)
							.send(machineJson);
					}
				});
			} catch (error) {
				res.status(500)
					.send(error);
			}
		});

	router.route('/machines/:companyid/:id')
		.get(function(req, res) {
			try {
				dbClient.read("dynamo", {
					"region": configObject.machineApi.dynamo.region,
					"endpoint": configObject.machineApi.dynamo.endpoint,
					"table": configObject.machineApi.dynamo.table,
					"primaryKeys": configObject.machineApi.dynamo.primaryKeys
				}, req.params.companyid, req.params.id, function(error, machineJson) {
					if (error) {
						res.status(400)
							.send(error);
					} else {
						res.status(200)
							.send(machineJson);
					}
				});
			} catch (error) {
				res.status(500)
					.send(error);
			}
		})
		.put(function(req, res) {
			var validation = validate(req.body, machineSchema);
			if (validation.errors.length === 0) {
				try {
					dbClient.update("dynamo", {
						"region": configObject.machineApi.dynamo.region,
						"endpoint": configObject.machineApi.dynamo.endpoint,
						"table": configObject.machineApi.dynamo.table,
						"primaryKeys": configObject.machineApi.dynamo.primaryKeys
					}, req.params.companyid, req.params.id, req.body, function(error, machineJson) {
						if (error) {
							res.status(400)
								.send(error);
						} else {
							res.status(200)
								.send(machineJson);
						}
					});
				} catch (error) {
					res.status(500)
						.send(error);
				}
			} else {
				var errors = [];
				validation.errors.forEach(function(element, index) {
					errors[index] = element.stack;
				});
				res.send(400, errors);
			}
		})
		.delete(function(req, res) {
			try {
				dbClient.delete("dynamo", {
					"region": configObject.machineApi.dynamo.region,
					"endpoint": configObject.machineApi.dynamo.endpoint,
					"table": configObject.machineApi.dynamo.table,
					"primaryKeys": configObject.machineApi.dynamo.primaryKeys
				}, req.params.companyid, req.params.id, function(error, machineJson) {
					if (error) {
						res.status(400)
							.send(error);
					} else {
						res.status(200)
							.send(machineJson);
					}
				});
			} catch (error) {
				res.status(500)
					.send(error);
			}
		});
};