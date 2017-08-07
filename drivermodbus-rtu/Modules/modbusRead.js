function ModBusRead(argument) {
    //Importation of the Modules needed to process the information
    var SerialPort = require("serialport");
    var modbus = require("modbus-rtu");
    var winston = require("winston");
    var Promise = require("bluebird");
    var bufferData = require("./bufferData");
    var async = require("async");
    var db = {};
    var deviceList = [];
    var comPortPath = "";
    var readRate = 500;
    var endPacketTimeout = 15;
    var responseTimeout = 100;
    var comPortConfig = {};
    var serialPort = "";
    var master = "";

    var ok = [];
    var timeout = [];
    var zerotimer = [];
    var error = [];

    var calculteTwosComplement = function(number) {
        var bitrep = (number >>> 0).toString(2);
        if (bitrep[0] == 1) {
            bitrep = bitrep.substring(1, bitrep.length);
            var numRef = Math.pow(2, bitrep.length);
            return parseInt(bitrep, 2) - numRef;
        } else {
            bitrep = bitrep.substring(1, bitrep.length);
            return parseInt(bitrep, 2);
        }
    };

    var printStatus = function(typeOfError, deviceId, errormessage) {
        switch (typeOfError) {
            case 1:
                //winston.info("Ok:" + deviceId)
                ok.push(deviceId);
                break;
            case 2:
                timeout.push(deviceId);
                winston.error(errormessage);
                break;
            case 3:
                zerotimer.push(deviceId);
                winston.error(errormessage);
                break;
            case 4:
                error.push(deviceId);
                winston.error(errormessage);
                break;
        }
        if (
            ok.length + timeout.length + zerotimer.length + error.length ===
            deviceList.length
        ) {
            winston.info("==============================================");
            winston.info("==============================================");
            winston.info("OK: " + ok + " Quantidade " + ok.length);
            winston.info("Timeout: " + timeout + " Quantidade " + timeout.length);
            winston.info("ZeroTimer: " + zerotimer + " Quantidade " + zerotimer.length);
            winston.info("Error: " + error + " Quantidade " + error.length);
            winston.info("==============================================");
            winston.info("==============================================");
        }
    };
    var findValue = function(array, key, value, returnProperty) {
        for (var index = 0; index < array.length; index++) {
            var element = array[index];
            if (element[key] === value) return element[returnProperty];
        }
    };

    function readSignal(deviceID, signal) {
        var offset = new Date().getTimezoneOffset();
        var utc_date = new Date();
        var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
        if (signal.signalType === "unique") {
            var registerlLength = Math.ceil(signal.bitSize / 8);
            var registerIndex = signal.registerNumber;
            return master
                .readHoldingRegisters(
                    deviceID,
                    registerIndex,
                    registerlLength,
                    function(rawBuffer) {
                        return rawBuffer;
                    }
                )
                .then(function(buffer) {
                    if (signal.twosComplement) {
                        var result = buffer.readUIntBE(0, 1);
                        result = calculteTwosComplement(result);
                    } else {
                        switch (signal.bitSize) {
                            case 32:
                                if (signal.signed === true) {
                                    var result = buffer.readInt32BE();
                                } else {
                                    var result = buffer.readUInt32BE();
                                }
                                break;
                            case 16:
                                if (signal.signed === true) {
                                    var result = buffer.readInt16BE();
                                } else {
                                    var result = buffer.readUInt16BE();
                                }
                                break;
                            case 8:
                                if (signal.signed === true) {
                                    var result = buffer.readIntBE(0, 1);
                                } else {
                                    var result = buffer.readUIntBE(0, 1);
                                }
                                break;
                        }
                    }
                    result = result * signal.scale;
                    var signalRead = {
                        tag: signal.name,
                        value: result,
                        timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
                    };
                    return signalRead;
                });
        } else if (signal.signalType === "batch") {
            var length = signal.endRegister - signal.startRegister + 1;
            if (signal.divisions[signal.divisions.length - 1].bitSize === 32) {
                length = length + 1;
            }
            return master
                .readHoldingRegisters(deviceID, signal.startRegister, length, function(
                    rawBuffer
                ) {
                    return rawBuffer;
                })
                .then(function(buffer) {
                    var pointer = 0;
                    var reads = [];
                    var indexArray = 0;
                    while (indexArray < signal.divisions.length) {
                        var shift = Math.ceil(signal.divisions[indexArray].bitSize / 8);
                        if (signal.twosComplement) {
                            var result = buffer.readUIntBE(0, 1);
                            result = calculteTwosComplement(result);
                        } else {
                            if (signal.signed === true) {
                                var result = buffer.readIntBE(pointer, shift);
                            } else {
                                var result = buffer.readUIntBE(pointer, shift);
                            }
                        }

                        result = result * signal.divisions[indexArray].scale;
                        var signalRead = {
                            tag: signal.divisions[indexArray].name,
                            value: result,
                            timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
                        };
                        pointer = pointer + shift;
                        indexArray = indexArray + 1;
                        reads.push(signalRead);
                    }
                    return reads;
                });
        } else {
            throw new Error("signalType Not Found!");
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

        Promise.all(promises)
            .then(function(reads) {
                var flattenReads = [].concat.apply([], reads);
                var dataCapture = {
                    dataSourceID: device.deviceID,
                    MeasureDataList: flattenReads
                };
                var year = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Year",
                    "value"
                );
                var month = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Month",
                    "value"
                );
                var day = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Day",
                    "value"
                );
                var hour = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Hour",
                    "value"
                );
                var min = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Min",
                    "value"
                );
                var sec = findValue(
                    dataCapture.MeasureDataList,
                    "tag",
                    "Energy Counter Timestamp, Sec",
                    "value"
                );
                var timeread = {
                    tag: "MeasurementTimeStamp",
                    value: new Date(year, month, day, hour, min, sec, 0),
                    timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
                };
                dataCapture.MeasureDataList.push(timeread);
                if (timeread.value.toISOString() != "1899-12-31T02:00:00.000Z") {
                    db.findOne({ dataSourceID: device.deviceID }, function(err, doc) {
                        if (doc === null) {
                            db.insert(dataCapture);
                            printStatus(1, dataCapture.dataSourceID);
                            bufferData.bufferData(dataCapture);
                            var curTimeStamp = findValue(
                                dataCapture.MeasureDataList,
                                "tag",
                                "MeasurementTimeStamp",
                                "value"
                            );
                            curTimeStamp = new Date(curTimeStamp);
                            winston.info(
                                "Medidor: " +
                                device.deviceID +
                                "-curTimeStamp: " +
                                curTimeStamp.getHours() +
                                ":" +
                                curTimeStamp.getMinutes() +
                                ":" +
                                curTimeStamp.getSeconds()
                            );
                        } else {
                            var lastTimestamp = findValue(
                                doc.MeasureDataList,
                                "tag",
                                "MeasurementTimeStamp",
                                "value"
                            );
                            var curTimeStamp = findValue(
                                dataCapture.MeasureDataList,
                                "tag",
                                "MeasurementTimeStamp",
                                "value"
                            );
                            curTimeStamp = new Date(curTimeStamp);
                            lastTimestamp = new Date(lastTimestamp);
                            var dif = curTimeStamp - lastTimestamp;
                            winston.info(
                                "Medidor: " +
                                device.deviceID +
                                "-Diff: " +
                                dif +
                                "-curTimeStamp: " +
                                curTimeStamp.getHours() +
                                ":" +
                                curTimeStamp.getMinutes() +
                                ":" +
                                curTimeStamp.getSeconds() +
                                "-lastTimestamp: " +
                                lastTimestamp.getHours() +
                                ":" +
                                lastTimestamp.getMinutes() +
                                ":" +
                                lastTimestamp.getSeconds() +
                                "-timeSinceRead: " +
                                new Date(dif).getMinutes() +
                                ":" +
                                new Date(dif).getSeconds()
                            );

                            if (dif > 0) {
                                printStatus(1, dataCapture.dataSourceID);
                                bufferData.bufferData(dataCapture);
                                db.update({ dataSourceID: device.deviceID },
                                    dataCapture, {},
                                    function(err, numReplaced) {}
                                );
                            } else if (dif === 0) {
                                printStatus(
                                    2,
                                    device.deviceID,
                                    "Medidor: " + dataCapture.dataSourceID + " Timedout"
                                );
                            } else {
                                db.remove({ dataSourceID: device.deviceID }, { multi: true },
                                    function(err, numRemoved) {
                                        if (err) winston.error("Erro: " + device.deviceID);
                                    }
                                );
                                printStatus(
                                    3,
                                    device.deviceID,
                                    "Medidor: " + device.deviceID + " TimeStampNulo "
                                );
                            }

                        }
                    });
                } else {
                    db.remove({ dataSourceID: device.deviceID }, { multi: true },
                        function(err, numRemoved) {
                            if (err) winston.error("Erro: " + device.deviceID);
                        }
                    );
                    printStatus(
                        3,
                        device.deviceID,
                        "Medidor: " + device.deviceID + " TimeStampNulo "
                    );
                }
            })
            .catch(function(err) {
                printStatus(
                    4,
                    device.deviceID,
                    "Medidor: " + device.deviceID + " " + err
                );
                db.remove({ dataSourceID: device.deviceID }, { multi: true }, function(
                    err,
                    numRemoved
                ) {
                    if (err) winston.error("Erro: " + device.deviceID);
                });
            });
    };

    var readAllDevices = function(deviceList) {
        deviceList.forEach(function(device) {
            readDeviceModbusRTU(device);
        });
    };

    return {
        startRead: function(
            newDeviceList,
            newComPortPath,
            newComPortConfig,
            newReadRate,
            newEndPacketTimeout,
            newResponseTimeout,
            newdb,
            exMaster
        ) {
            deviceList = newDeviceList;
            comPortPath = newComPortPath;
            readRate = newReadRate;
            db = newdb;
            master = exMaster;
            endPacketTimeout = newEndPacketTimeout;
            responseTimeout = newResponseTimeout;
            comPortConfig = newComPortConfig;
            //var serialPort = new SerialPort("/" + comPortPath, comPortConfig);

            //master = new modbus.Master(serialPort);
            function readModbusRTU(argument) {
                readAllDevices(deviceList);
                ok = [];
                timeout = [];
                zerotimer = [];
                error = [];
                setTimeout(readModbusRTU, readRate);
            }
            readModbusRTU();
        }
    };
}

var modbusRead = new ModBusRead();
modbusRead.ModBusRead = ModBusRead;
module.exports = modbusRead;