function machineDB() {
	var AWS = new require("aws-sdk");

	function createItem(options, inputdata, callback) {
		try {
			var uuid = require('node-uuid');

			AWS.config.update({
				region: options.region,
				endpoint: options.endpoint
			});
			var docClient = new AWS.DynamoDB.DocumentClient();
			var ID = uuid.v4();
			var companyID = inputdata.companyID;
			delete inputdata.companyID;
			var table = options.table;
			var keys = options.primaryKeys;
			var values = [ID, companyID, inputdata];
			var items = {};
			for (var i = 0; i < keys.length; i++) {
				items[keys[i]] = values[i];
			}
			var params = {
				TableName: table,
				Item: items
			};

			docClient.put(params, function(err, data) {
				if (err) {
					callback(JSON.stringify(err, null, 2), null);
				} else {
					inputdata.companyID = companyID;
					inputdata[keys[0]] = ID;
					callback(null, inputdata);
				}
			});
		} catch (err) {
			callback(JSON.stringify(err, null, 2), null);
		}
	}

	function getAllItens(options, companyID, callback) {
		try {

			AWS.config.update({
				region: options.region,
				endpoint: options.endpoint
			});
			var docClient = new AWS.DynamoDB.DocumentClient();
			var primarykey = ":" + options.primaryKeys[0];

			var table = options.table;
			var params = {
				TableName: table,
				FilterExpression: "companyID = :companyID",
				ExpressionAttributeValues: {
					":companyID": companyID
				}
			};


			docClient.scan(params, function(err, data) {
				if (err) {
					callback(JSON.stringify(err, null, 2), null);
				} else {
					callback(null, data.Items);
				}
			});
		} catch (err) {
			callback(err, null);
		}
	}

	function getItem(options, companyID, ID, callback) {
		try {
			AWS.config.update({
				region: options.region,
				endpoint: options.endpoint
			});
			var docClient = new AWS.DynamoDB.DocumentClient();
			var primarykey = options.primaryKeys[0];
			var expression = primarykey + " = :" + primarykey + " and companyID = :companyID ";
			primarykey = ":" + primarykey;
			var table = options.table;
			var params = {
				TableName: table,
				KeyConditionExpression: expression,
				ExpressionAttributeValues: {}
			};
			params.ExpressionAttributeValues[":companyID"] = companyID;
			params.ExpressionAttributeValues[primarykey] = ID;
			docClient.query(params, function(err, data) {
				if (err) {
					callback(JSON.stringify(err, null, 2), null);
				} else {
					if (data.Items.length > 0) {
						callback(null, data.Items[0]);
					} else {
						callback("No machine with this ID", null);
					}
				}
			});
		} catch (err) {
			callback(err, null);
		}
	}

	function updateItem(options, companyID, ID, data, callback) {
		try {
			AWS.config.update({
				region: options.region,
				endpoint: options.endpoint
			});
			var docClient = new AWS.DynamoDB.DocumentClient();
			var expression = "set " + options.primaryKeys[2] + " = :json"
			var table = options.table;
			var params = {
				TableName: table,
				Key: {},
				UpdateExpression: expression,
				ExpressionAttributeValues: {
					":json": data
				},
				ReturnValues: "UPDATED_NEW"
			};

			params.Key[options.primaryKeys[0]] = ID;
			params.Key[options.primaryKeys[1]] = companyID;
			docClient.update(params, function(err, data) {
				if (err) {
					callback(JSON.stringify(err, null, 2), null);
				} else {
					var dataJson = data.Attributes.info;
					dataJson[options.primaryKeys[0]] = ID
					callback(null, data.Attributes.info);
				}
			});
		} catch (err) {
			callback(err, null);
		}
	}

	function deleteItem(options, companyID, ID, callback) {
		try {
			AWS.config.update({
				region: options.region,
				endpoint: options.endpoint
			});
			var docClient = new AWS.DynamoDB.DocumentClient();

			var table = options.table;
			var params = {
				TableName: table,
				Key: {},

			};
			params.Key[options.primaryKeys[0]] = ID;
			params.Key[options.primaryKeys[1]] = companyID;

			docClient.delete(params, function(err, data) {
				if (err) {
					callback(JSON.stringify(err, null, 2), null);
				} else {
					callback(null, 'Sucess');
				}
			});
		} catch (err) {
			callback(err, null);
		}
	}


	return {
		create: createItem,
		readAll: getAllItens,
		read: getItem,
		update: updateItem,
		delete: deleteItem
	};
}


var machine = new machineDB();
machine.machineDB = machineDB;
module.exports = machine;