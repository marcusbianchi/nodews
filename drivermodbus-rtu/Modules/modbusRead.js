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
                    var result = buffer.readUIntBE(pointer, 1);
                    result = calculteTwosComplement(result);
                } else {
                    var result = buffer.readUIntBE(pointer, shift);
                }
                result = result * signal.divisions[indexArray].scale;
                var signalRead = {
                    "tag": signal.divisions[indexArray].name,
                    "value": result,
                    "timeStampTicks": (currDate * 10000) + 621355968000000000 //Ticks .net
                }
                pointer = pointer + shift;
                indexArray = indexArray + 1;
                reads.push(signalRead);
            }
            return reads;
        });
    }


    function readUniqueSignal(deviceID, registerIndex, registerlLength) {
               var offset = new Date().getTimezoneOffset();
    var utc_date = new Date();
    var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
        var registerlLength = Math.ceil(signal.bitSize / 8);
        var registerIndex = signal.registerNumber;
        return master.readHoldingRegisters(deviceID,
            registerIndex, registerlLength,
            function(rawBuffer) {
                return rawBuffer
            }).then(function(buffer) {
            if (signal.twosComplement) {
                var result = buffer.readUIntBE(pointer, 1);
                result = calculteTwosComplement(result);
            } else {
                switch (signal.bitSize) {
                    case 32:
                        var result = buffer.readUInt32BE();
                        break;
                    case 16:
                        var result = buffer.readUInt16BE();
                        break;
                    case 8:
                        var result = buffer.readUIntBE(0, 1);
                        break;
                }
            }

            result = result * signal.scale;
            var signalRead = {
                "tag": signal.name,
                "value": result,
                "timeStampTicks": (currDate * 10000) + 621355968000000000 //Ticks .net
            }
            return signalRead;
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
                    var result = buffer.readUIntBE(0, 1);
                    result = calculteTwosComplement(result);
                } else {
                    switch (signal.bitSize) {
                        case 32:
                            var result = buffer.readUInt32BE();
                            break;
                        case 16:
                            var result = buffer.readUInt16BE();
                            break;
                        case 8:
                            var result = buffer.readUIntBE(0, 1);
                            break;

                    }
                }
                result = result * signal.scale;
                var signalRead = {
                    "tag": signal.name,
                    "value": result,
                    "timeStampTicks": (currDate * 10000) + 621355968000000000 //Ticks .net
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
                        var result = buffer.readUIntBE(0, 1);
                        result = calculteTwosComplement(result);
                    } else {
                        var result = buffer.readUIntBE(pointer, shift);
                    }

                    result = result * signal.divisions[indexArray].scale;
                    var signalRead = {
                        "tag": signal.divisions[indexArray].name,
                        "value": result,
                        "timeStampTicks": (currDate * 10000) + 621355968000000000 //Ticks .net
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
            db.findOne({ dataSourceID: device.deviceID }, function(err, doc) {
                if (doc === null)
                    db.insert(dataCapture);
                else
                    db.update({ dataSourceID: device.deviceID }, dataCapture, {}, function(err, numReplaced) {
                    });

            });

        }).catch(function(err) {
            winston.error("Device: " + device.deviceID)
            db.remove({ dataSourceID: device.deviceID }, { multi: true }, function(err, numRemoved) {
                if (err)
                     winston.error("Erro: " + device.deviceID);
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
            newReadRate, newEndPacketTimeout, newResponseTimeout, newdb,exMaster) {
            deviceList = newDeviceList;
            comPortPath = newComPortPath;
            readRate = newReadRate;
            db = newdb;
			master = exMaster;
            endPacketTimeout = newEndPacketTimeout;
            responseTimeout = newResponseTimeout;
            comPortConfig = newComPortConfig;
            //var serialPort = new SerialPort("/" + comPortPath, comPortConfig);
            var constants = require('modbus-rtu/constants');
           master._options.endPacketTimeout = endPacketTimeout;
            master._options.responseTimeout= responseTimeout;
            //master = new modbus.Master(serialPort);
            function readModbusRTU(argument) {
                readAllDevices(deviceList);
                setTimeout(readModbusRTU, readRate);
                virtualDevicesRead.startController(db);
            }
            readModbusRTU();
        }
    }
}

var modbusRead = new ModBusRead();
modbusRead.ModBusRead = ModBusRead;
module.exports = modbusRead;
