var Sequelize = require('sequelize');

var sequelize = new Sequelize('tclcontrol', 'sa', 'Spi1234', {
	host: 'SERVTI02',
	dialect: 'mssql',
	dialectOptions: {
		instanceName: 'SQLEXPRESS2008'
	},
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});


var Vendor = sequelize.define('vendor', {
	companyName: {
		type: Sequelize.STRING,
	},
	vendorName: {
		type: Sequelize.STRING
	},
	qtyAttempts: {
		type: Sequelize.INTEGER
	},
	lastAttempt: {
		type: Sequelize.BIGINT
	}
}, {
	freezeTableName: true // Model tableName will be the same as the model name
});

Vendor.sync({
	force: true
}).then(function() {
	return Vendor.create({
		companyName: 'John',
		vendorName: 'Hancock',
		qtyAttempts: 1,
		lastAttempt: new Date().getTime()
	});
});