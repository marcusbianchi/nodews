function VirtualDevicesRead(a) {
    //Importation of the Modules needed to process the information
    var winston = require("winston");
    var fs = require("fs");
    var math = require("mathjs");
    var virtualDevices = [];
    var winston = require("winston");
    var bufferData = require("./bufferData");
    var datacataptureAddress = "";
    var db = {};
    var readRate = 300000;
    var numberofdevices = 0;
    var findValue = function(array, key, value, returnProperty) {
        for (var index = 0; index < array.length; index++) {
            var element = array[index];
            if (element[key] === value) return element[returnProperty];
        }
    };
    var readVirtualDevice = function(fileName) {
        fs.readFile("./VirtualDevices/" + fileName, "utf8", function(error, data) {
            if (error) {
                winston.error("Read File Data Error", error);
            } else {
                virtualDevices.push(JSON.parse(data));
                if (numberofdevices == virtualDevices.length) {
                    readController();
                    //console.log(virtualDevices);
                }
            }
        });
    };
    var readFromVirtualDevicesFolder = function() {
        fs.readdir("./VirtualDevices", function(error, files) {
            if (error) {
                winston.error("Read Buffer Error", error);
            } else {
                numberofdevices = files.length;
                for (var i = files.length - 1; i >= 0; i--) {
                    readVirtualDevice(files[i]);
                }
            }
        });
    };

    var readController = function() {
        readVirtualReadings();
    };

    var readVirtualReadings = function() {
        for (var i = virtualDevices.length - 1; i >= 0; i--) {
            var devices = [];

            for (var key in virtualDevices[i].deviceList) {
                var value = virtualDevices[i].deviceList[key];
                devices.push(parseInt(value));
            }
            Processreading(
                JSON.stringify(virtualDevices[i]),
                JSON.stringify(devices)
            );
        }
    };

    var Processreading = function(exVirtualDevice, exDevices) {
        var devices = [];
        var virtualDevice = {};
        devices = JSON.parse(exDevices);
        virtualDevice = JSON.parse(exVirtualDevice);
        var expr = virtualDevice.equation;
        var code = math.compile(expr);
        var offset = new Date().getTimezoneOffset();
        var utc_date = new Date();
        var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);

        var reads = [];
        db.find({ dataSourceID: { $in: devices } }, function(err, docs) {
            if (docs.length == devices.length) {
                var signals = virtualDevice.processSignals;
                for (var j = signals.length - 1; j >= 0; j--) {
                    var scope = {};
                    for (var key in virtualDevice.deviceList) {
                        var index = functiontofindIndexByKeyValue(
                            docs,
                            "dataSourceID",
                            virtualDevice.deviceList[key]
                        );
                        var indexmeas = functiontofindIndexByKeyValue(
                            docs[index].MeasureDataList,
                            "tag",
                            signals[j]
                        );
                        scope[key] = parseInt(docs[index].MeasureDataList[indexmeas].value);
                    }
                    var result = code.eval(scope);
                    var signalRead = {
                        tag: signals[j],
                        value: result,
                        timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
                    };
                    reads.push(signalRead);
                }
                var dataCaptureInst = {
                    dataSourceID: virtualDevice.deviceID,
                    MeasureDataList: reads
                };
                Increment(virtualDevice.deviceID, dataCaptureInst);
                //var dcJson = JSON.stringify(dataCapture);
                //bufferData.bufferData(JSON.parse(dcJson));
            } else {
                winston.error("Error " + virtualDevice.deviceID);
            }
        });
    };
    var Increment = function(device, dataCaptureInst) {
        request(
            datacataptureAddress + "?datasourceid=" + device + "&count=1",
            function(error, response, body) {
                if (error) winstom.error(error);
                else if (response.statusCode == 200) {
                    var jsonBody = JSON.parse(body);
                    var offset = new Date().getTimezoneOffset();
                    var utc_date = new Date();
                    var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
                    if (jsonBody.length == 1) {
                        var curMeas = jsonBody[0];
                        var dataCapture = {};
                        var MeasureDataList = [];
                        for (var index = 0; index < processSignals.length; index++) {
                            var processSignal = processSignals[index];
                            var curSignalValue = findValue(
                                curMeas.MeasureDataList,
                                "tag",
                                processSignal,
                                "value"
                            );
                            var instSignalValue = findValue(
                                dataCaptureInst.MeasureDataList,
                                "tag",
                                processSignal,
                                "value"
                            );
                            var signalRead = {
                                tag: processSignal,
                                value: curSignalValue + instSignalValue,
                                timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
                            };
                            MeasureDataList.push(signalRead);
                        }
                        dataCapture.dataSourceID = device;
                        dataCapture.MeasureDataList = MeasureDataList;
                        bufferData.bufferData(dataCapture);
                    } else if (jsonBody.length == 0) {
                        bufferData.bufferData(dataCaptureInst);
                    }
                }
            }
        );
    };

    function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    return {
        startController: function(newdb, datacataptureAddress) {
            db = newdb;
            virtualDevices = [];
            datacataptureAddress = datacataptureAddress;
            readFromVirtualDevicesFolder();
            readController();
        }
    };
}

var virtualDevicesRead = new VirtualDevicesRead();
virtualDevicesRead.VirtualDevicesRead = VirtualDevicesRead;
module.exports = virtualDevicesRead;