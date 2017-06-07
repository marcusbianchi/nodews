function ModBusRead(argument) {
	//Importation of the Modules needed to process the information
	var SerialPort = require('serialport');
	var modbus = require('modbus-rtu');
	var winston = require('winston');
	var Promise = require("bluebird");
	var bufferData = require('./bufferData');
	var virtualDevicesRead = require('../Modules/virtualDevicesRead');
	var async = require('async');
	var db = {};
	var deviceList = [];
	var comPortPath = "";
	var readRate = 500;
	var endPacketTimeout = 15;
	var responseTimeout = 100;
	var comPortConfig = {};
	var serialPort = "";
	var master = "";

	var calculteTwosComplement = function(number) {
		var bitrep = (number >>> 0).toString(2)
		if (bitrep[0] == 1) {
			bitrep = bitrep.substring(1, bitrep.length);
			var numRef = Math.pow(2, bitrep.length);
			return parseInt(bitrep, 2) - numRef
		} else {
			bitrep = bitrep.substring(1, bitrep.length);
			return parseInt(bitrep, 2)
		}
	}

	var readBatchSignal = function(deviceID, signal) {
		var offset = new Date().getTimezoneOffset();
		var utc_date = new Date();
		var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
		var length = signal.endRegister - signal.startRegister + 1;
		if (signal.divisions[signal.divisions.length - 1].bitSize === 32) {
			length = length + 1;
		}
		winston.info(length);
		return master.readHoldingRegisters(deviceID, signal.startRegister, length,
			function(rawBuffer) {
				return rawBuffer
			}).then(function(buffer) {
			var pointer = 0;
			var reads = [];
			var indexArray = 0;
			while (indexArray < signal.divisions.length) {
				var shift = Math.ceil(signal.bitSize / 8);;
				if (signal.twosComplement) {
                    if(signal.signed)
                       var result = buffer.readIntBE(pointer, 1);
                    else
                        var result = buffer.readUIntBE(pointer, 1);
					result = calculteTwosComplement(result);
				} else {
                    if(signal.signed)
                       var result = buffer.readIntBE(pointer, shift);
                    else
                        var result = buffer.readUIntBE(pointer, shift);
				}
				result = result * signal.divisions[indexArray].scale;
				var signalRead = {
					"tag": signal.divisions[indexArray].name,
					"value": result,
					"timeStampTicks": ((new Date(currDate)).getTime() * 10000) + 621355968000000000 //Ticks .net
				}
				pointer = pointer + shift;
				indexArray = indexArray + 1;
				reads.push(signalRead);
			}
			return reads;
		});
	}


	function readSignal(deviceID, signal) {
		var offset = new Date().getTimezoneOffset();
		var utc_date = new Date();
		var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
		if (signal.signalType === "unique") {
			var registerlLength = Math.ceil(signal.bitSize / 8);
			var registerIndex = signal.registerNumber;
			return master.readHoldingRegisters(deviceID,
				registerIndex, registerlLength,
				function(rawBuffer) {
					return rawBuffer
				}).then(function(buffer) {
				if (signal.twosComplement) {
                    if(signal.signed)
                       var result = buffer.readIntBE(0, 1);
                    else
                        var result = buffer.readUIntBE(0, 1);
					result = calculteTwosComplement(result);
				} else {
					switch (signal.bitSize) {
						case 32:
                            if(signal.signed)
                                var result = buffer.readInt32BE();
                            else
                                var result = buffer.readUInt32BE();
							break;
						case 16:
                             if(signal.signed)
                                var result = buffer.readInt16BE();
                            else
                                var result = buffer.readUInt16BE();
							break;
						case 8:
                             if(signal.signed)
                                var result = buffer.readIntBE(0, 1);
                            else
                                var result = buffer.readUIntBE(0, 1);
							break;

					}
				}
				result = result * signal.scale;
				var signalRead = {
					"tag": signal.name,
					"value": result,
					"timeStampTicks": (currDate.getTime() * 10000) + 621355968000000000 //Ticks .net
				}
				return signalRead;
			});
		} else if (signal.signalType === "batch") {
			var length = signal.endRegister - signal.startRegister + 1;
			if (signal.divisions[signal.divisions.length - 1].bitSize === 32) {
				length = length + 1;
			}
			return master.readHoldingRegisters(deviceID, signal.startRegister, length,
				function(rawBuffer) {
					return rawBuffer
				}).then(function(buffer) {
				var pointer = 0;
				var reads = [];
				var indexArray = 0;
				while (indexArray < signal.divisions.length) {
					var shift = Math.ceil(signal.divisions[indexArray].bitSize / 8);
					if (signal.twosComplement) {
                        if(signal.signed)
                            var result = buffer.readIntBE(0, 1);
                        else
                            var result = buffer.readUIntBE(0, 1);
						result = calculteTwosComplement(result);
					} else {
                        if(signal.signed)
                            var result = buffer.readIntBE(pointer, shift);
                        else
                            var result = buffer.readUIntBE(pointer, shift);
					}

					result = result * signal.divisions[indexArray].scale;
					var signalRead = {
						"tag": signal.divisions[indexArray].name,
						"value": result,
						"timeStampTicks": (currDate.getTime() * 10000) + 621355968000000000 //Ticks .net
					}
					pointer = pointer + shift;
					indexArray = indexArray + 1;
					reads.push(signalRead);
				}
				return reads;
			});
		} else {
			throw new Error('signalType Not Found!');
		}
	}

	var readDeviceModbusRTU = function(device) {
		var offset = new Date().getTimezoneOffset();
		var utc_date = new Date();
		var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
		var deviceID = device.deviceID;
		promises = [];
		for (var i = 0; i < device.signals.length; i++) {
			promises.push(readSignal(deviceID, device.signals[i]));
		}

		Promise.all(promises).then(function(reads) {
			var flattenReads = [].concat.apply([], reads);
			var dataCapture = {
				"dataSourceID": device.deviceID,
				"MeasureDataList": flattenReads
			};
			winston.info("Lido " + dataCapture.dataSourceID);
			bufferData.bufferData(dataCapture);
			db.findOne({
				dataSourceID: device.deviceID
			}, function(err, doc) {
				if (doc === null)
					db.insert(dataCapture);
				else
					db.update({
						dataSourceID: device.deviceID
					}, dataCapture, {}, function(err, numReplaced) {
						winston.info('numReplaced ' + numReplaced)
					});

			});

		}).catch(function(err) {
			winston.error("Device: " + device.deviceID, err)
			db.remove({
				dataSourceID: device.deviceID
			}, {
				multi: true
			}, function(err, numRemoved) {
				if (err)
					winston.error(err);
				else
					winston.info('NumRemoved ' + numRemoved);
			});
		})
	}

	var readAllDevices = function(deviceList) {
		deviceList.forEach(function(device) {
			readDeviceModbusRTU(device);
		});
	}

	return {
		startRead: function(newDeviceList, newComPortPath, newComPortConfig,
			newReadRate, newEndPacketTimeout, newResponseTimeout, newdb, master) {
			deviceList = newDeviceList;
			comPortPath = newComPortPath;
			readRate = newReadRate;
			db = newdb;
			endPacketTimeout = newEndPacketTimeout;
			responseTimeout = newResponseTimeout;
			comPortConfig = newComPortConfig;
			// var serialPort = new SerialPort("/" + comPortPath, comPortConfig);
			var constants = require('modbus-rtu/constants');
			constants.END_PACKET_TIMEOUT = endPacketTimeout;
			constants.RESPONSE_TIMEOUT = responseTimeout;
			// master = new modbus.Master(serialPort);
			function readModbusRTU(argument) {
				readAllDevices(deviceList);
				setTimeout(readModbusRTU, readRate);
				virtualDevicesRead.startController(db);
			}
			master = master;
			readModbusRTU();
		}
	}
}

var modbusRead = new ModBusRead();
modbusRead.ModBusRead = ModBusRead;
module.exports = modbusRead;
