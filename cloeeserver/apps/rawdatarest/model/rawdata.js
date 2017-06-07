function rawdata() {
	return {

		"type": "object",
		"properties": {
			"companyID": {
				"type": "integer"
			},
			"accountID": {
				"type": "integer"
			},
			"dataSourceID": {
				"type": "integer"
			},
			"registeredEquipment": {
				"type": "array",
				"items": {
					"type": "object",
					"properties": {
						"equipmentID": {
							"type": "integer"
						},
						"measuredDataList": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"tag": {
										"type": "string"
									},
									"value": {
										"type": "integer"
									},
									"timeStampTicks": {
										"type": "integer"
									}
								},
								"required": [
									"tag",
									"value",
									"timeStampTicks"
								]
							}
						}
					},
					"required": [
						"equipmentID",
						"measuredDataList"
					]
				}
			}
		},
		"required": [
			"companyID",
			"accountID",
			"dataSourceID",
			"registeredEquipment"
		]
	};
}

var rawdata = new rawdata();
rawdata.rawdata = rawdata;
module.exports = rawdata;