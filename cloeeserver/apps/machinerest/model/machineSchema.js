function machineSchema() {
	return {
		"type": "object",
		"properties": {
			"equipmentID": {
				"type": "string"
			},
			"equipmentName": {
				"type": "string"
			},
			"companyID": {
				"type": "string"
			},
			"status": {
				"type": "string"
			},
			"description": {
				"type": "string"
			},
			"model": {
				"type": "string"
			},
			"brand": {
				"type": "string"
			},
			"group": {
				"type": "string"
			},
			"timeRange": {
				"type": "string"
			},
			"triggers": {
				"type": "array",
				"items": {
					"type": "object",
					"properties": {
						"eventType": {
							"type": "string"
						},
						"multiplier": {
							"type": "string"
						},
						"scale": {
							"type": "string"
						},
						"unid": {
							"type": "string"
						},
						"offset": {
							"type": "string"
						},
						"conditionEquation": {
							"type": "string"
						},
						"conditions": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"tag": {
										"type": "string"
									},
									"operator": {
										"type": "string"
									},
									"value": {
										"type": "string"
									}
								},
								"required": [
									"tag",
									"operator",
									"value"
								]
							}
						}
					},
					"required": [
						"eventType",
						"multiplier",
						"scale",
						"unid",
						"offset",
						"conditionEquation",
						"conditions"
					]
				}
			}
		},
		"required": [
			"equipmentName",
			"companyID",
			"status",
			"description",
			"model",
			"brand",
			"group",
			"timeRange",
			"triggers"
		]
	};
};

var machine = new machineSchema();
machine.machineSchema = machineSchema;
module.exports = machine;