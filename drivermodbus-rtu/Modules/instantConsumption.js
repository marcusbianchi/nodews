var winston = require("winston");
var fs = require("fs");

function InstantConsumption() {
  //Importation of the Modules needed to process the information
  var request = require("request");
  var Datastore = require("nedb");
  var virtualDevicesRead = require("../Modules/virtualDevicesRead");
  var devices = [];
  var datacataptureAddress = "";
  var processSignals = "";
  var db = {};

  var findValue = function(array, key, value, returnProperty) {
    for (var index = 0; index < array.length; index++) {
      var element = array[index];
      if (element[key] === value) return element[returnProperty];
    }
  };

  var readAllDevicesMeas = function(devices) {
    for (var index = 0; index < devices.length; index++) {
      var device = devices[index];
      readDeviceMeas(device);
    }
  };

  var readDeviceMeas = function(device) {
    request(
      datacataptureAddress + "?datasourceid=" + device + "&count=2",
      function(error, response, body) {
        if (error) winstom.error(error);
        else if (response.statusCode == 200) {
          var jsonBody = JSON.parse(body);
          var offset = new Date().getTimezoneOffset();
          var utc_date = new Date();
          var currDate = utc_date.setMinutes(utc_date.getMinutes() - offset);
          if (jsonBody.length == 2) {
            var curMeas = jsonBody[0];
            var prevMeas = jsonBody[1];
            var dataCapture = {};
            var MeasureDataList = [];
            for (var index = 0; index < processSignals.length; index++) {
              var processSignal = processSignals[index];
              var prevSignalValue = findValue(
                prevMeas.MeasureDataList,
                "tag",
                processSignal,
                "value"
              );
              var curSignalValue = findValue(
                curMeas.MeasureDataList,
                "tag",
                processSignal,
                "value"
              );
              var signalRead = {
                tag: processSignal,
                value: curSignalValue - prevSignalValue,
                timeStampTicks: currDate * 10000 + 621355968000000000 //Ticks .net
              };
              MeasureDataList.push(signalRead);
            }
            dataCapture.dataSourceID = device;
            dataCapture.MeasureDataList = MeasureDataList;
            db.insert(dataCapture);
          }
        }
      }
    );
  };

  return {
    calculateInstantConsumption: function(config, deviceList) {
      datacataptureAddress = config.serviceAPI;
      processSignals = config.processSignals;
      db = new Datastore();
      for (var index = 0; index < deviceList.length; index++) {
        var element = deviceList[index];
        devices.push(element.deviceID);
      }

      function readVirtual() {
        readAllDevicesMeas(devices);
        virtualDevicesRead.startController(db);
        setTimeout(readVirtual, config.readRate);
      }
      readVirtual();
    }
  };
}

var instantConsumption = new InstantConsumption();
instantConsumption.InstantConsumption = InstantConsumption;
module.exports = instantConsumption;
