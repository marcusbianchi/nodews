function s3db() {
	var AWS = new require("aws-sdk");

	function createItem(options, inputdata, callback) {
		try {
			var id = new Date()
				.getTime();

			var s3bucket = new AWS.S3({
				endpoint: options.endpoint
			});

			params = {
				Bucket: options.bucket,
				Key: id + ".json",
				Body: JSON.stringify(inputdata)
			};

			s3bucket.upload(params, function(err, data) {
				if (err) {
					callback(err, null);

				} else {
					callback(null, id);

				}
			});
		} catch (err) {
			callback(err, null);
		}
	}

	function getAllItens(options, companyID, callback) {
		try {
			var allKeys = [];

			function listAllKeys(marker, cb) {
				var s3bucket = new AWS.S3({
					endpoint: options.endpoint
				});
				var params = {
					Bucket: options.bucket,
					Marker: marker,
					Prefix: companyID
				}

				s3.listObjects(params, function(err, data) {
					allKeys.push(data.Contents);
					if (data.IsTruncated)
						listAllKeys(data.NextMarker, cb);
					else
						cb();
				});
			}
			callback(null, allKeys);

		} catch (err) {
			callback(err, null);
		}

	}

	function getItem(options, companyID, ID, callback) {
		callback('Method Not Permited for this type of Database', null);
	}

	function updateItem(options, companyID, ID, data, callback) {
		callback('Method Not Permited for this type of Database', null);
	}

	function deleteItem(options, companyID, ID, callback) {
		callback('Method Not Permited for this type of Database', null);
	}


	return {
		create: createItem,
		readAll: getAllItens,
		read: getItem,
		update: updateItem,
		delete: deleteItem
	};
}


var s3 = new s3db();
s3.s3db = s3db;
module.exports = s3;