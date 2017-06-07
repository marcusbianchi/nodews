var DBClientFactory = (function() {
	var DynamoDBAPI = new require('./DBClients/DynamoDBAPI');
	var s3API = new require('./DBClients/s3API');
	var createItem = function createItem(databaseType, options, data, callback) {
		try {
			databaseType = databaseType ? databaseType.toLowerCase() : undefined;
			if (!databaseType) {
				throw {
					message: databaseType + " is not defined"
				};
			}
			switch (databaseType) {
				case "dynamo":
					DynamoDBAPI.create(options, data, callback);
					break;
				case "s3":
					s3API.create(options, data, callback);
					break;
				default:
					callback("The Method Create is not allowed for" + databaseType, null);
					break;
			}
		} catch (err) {
			callback(JSON.stringify(err, null, 2), null);
		}
	};

	var getAllItens = function getAllItens(databaseType, options, companyID, callback) {
		try {
			databaseType = databaseType ? databaseType.toLowerCase() : undefined;
			if (!databaseType) {
				throw {
					message: databaseType + " is not defined"
				};
			}
			switch (databaseType) {
				case "dynamo":
					DynamoDBAPI.readAll(options, companyID, callback);
					break;
				case "s3":
					s3API.readAll(options, data, callback);
					break;
				default:
					callback("The Method ReadALL is not allowed for" + databaseType, null);
					break;
			}
		} catch (err) {
			callback(JSON.stringify(err, null, 2), null);
		}
	};

	var getItem = function getItem(databaseType, options, companyID, ID, callback) {
		try {
			databaseType = databaseType ? databaseType.toLowerCase() : undefined;
			if (!databaseType) {
				throw {
					message: databaseType + " is not defined"
				};
			}
			switch (databaseType) {
				case "dynamo":
					DynamoDBAPI.read(options, companyID, ID, callback);
					break;
				case "s3":
					s3API.read(options, data, callback);
					break;
				default:
					callback("The Method Read is not allowed for" + databaseType, null);
					break;
			}
		} catch (err) {
			callback(JSON.stringify(err, null, 2), null);
		}
	};

	var updateItem = function updateItem(databaseType, options, companyID, ID, data, callback) {
		databaseType = databaseType ? databaseType.toLowerCase() : undefined;
		if (!databaseType) {
			throw {
				message: databaseType + " is not defined"
			};
		}
		switch (databaseType) {
			case "dynamo":
				DynamoDBAPI.update(options, companyID, ID, data, callback);
				break;
			case "s3":
				s3API.update(options, data, callback);
				break;
			default:
				callback("The Method Update is not allowed for" + databaseType, null);
				break;
		}
	};

	var deleteItem = function deleteItem(databaseType, options, companyID, ID, callback) {
		try {
			databaseType = databaseType ? databaseType.toLowerCase() : undefined;
			if (!databaseType) {
				throw {
					message: databaseType + " is not defined"
				};
			}
			switch (databaseType) {
				case "dynamo":
					DynamoDBAPI.delete(options, companyID, ID, callback);
					break;
				case "s3":
					s3API.delete(options, data, callback);
					break;
				default:
					callback("The Method read is not allowed for" + databaseType, null);
					break;
			}
		} catch (err) {
			callback(JSON.stringify(err, null, 2), null);
		}
	};

	return {
		create: createItem,
		readAll: getAllItens,
		read: getItem,
		update: updateItem,
		delete: deleteItem
	};
})();

module.exports = DBClientFactory;