function ModbusWrite() {
	//Importation of the Modules needed to process the information
	var SerialPort = require('serialport');
	var modbus = require('modbus-rtu');
	var Promise = require("bluebird");


	function writeReadInterval(deviceList, master, defaultTime, callback) {
		promises = [];
		for (var i = 0; i < deviceList.length; i++) {
			promises.push(writeReadIntervalToDevice(deviceList[i].deviceID, master, defaultTime);			}

			Promise.all(promises).then(function(results) {
				winston.info(results);
				callback();
			}).catch(function(err) {
				winston.error(err)
			}).then(function() {
				callback;
			});
		}

		function writeReadIntervalToDevice(deviceID, master, defaultTime) {
			this.deviceID = deviceID;
			return master.writeSingleRegister(deviceID, 53, defaultTime).then(function(valor) {
				return 'Sucesso Para' + deviceID;
			}, function() {
				return 'Erro Para' + deviceID;
			});
		}

		return {
			writeTimers: function(deviceList, master, defaultTime, callback) {
				writeReadInterval(deviceList, master, defaultTime, callback);
			}
		}
	}

	var modbusWrite = new ModbusWrite();
	modbusWrite.ModbusWrite = ModbusWrite;
	module.exports = modbusWrite;