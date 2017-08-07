var winston = require("winston");

function ModbusWrite() {
  //Importation of the Modules needed to process the information

  var devices = [];
  var devicesToWritePassword = [];
  var devicesToWriteInterval = [];
  var completedDevices = [];
  var master = {};
  var writePassword = true;

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var writeDevicePassWord = function(deviceId) {
    master.writeMultipleRegisters(deviceId, 298, [4660]);
    master.writeMultipleRegisters(deviceId, 349, [7100]);
    console.log("write password " + deviceId);
    devicesToWriteInterval.push(deviceId);
  };

  var writeDeviceInterval = function(deviceId) {
    master.writeMultipleRegisters(deviceId, 297, [240]);
    master.writeMultipleRegisters(deviceId, 349, [7200]);
    console.log("write interval " + deviceId);
    completedDevices.push(deviceId);
  };

  var writeDevicesPassword = function() {
    while (devicesToWritePassword.length != 0) {
      var element = devicesToWritePassword.pop();
      writeDevicePassWord(element);
    }
  };

  var writeDevicesInterval = function() {
    while (devicesToWriteInterval.length != 0) {
      var element = devicesToWriteInterval.pop();
      writeDeviceInterval(element);
    }
  };

  return {
    writeDevices: function(master, deviceList) {
      for (var index = 0; index < deviceList.length; index++) {
        var element = deviceList[index];
        devices.push(element.deviceID);
      }
      devices = deviceList;
      master = master;

      function writer() {
        if (devices.length === 0) {
          devices = completedDevices;
          completedDevices = [];
        }
        for (var index = 0; index < 5; index++) {
          removeIndex = getRandomInt(0, devices.length - 1);
          var element = devices[removeIndex];
          if (element !== undefined) {
            devicesToWritePassword.push(element);
            devices.splice(removeIndex, 1);
          }
        }

        if (writePassword) {
          writeDevicesPassword();
          writePassword = false;
        } else {
          writeDevicesInterval();
          writePassword = true;
        }

        setTimeout(writer, 10000);
      }
      writer();
    }
  };
}

var modbusWrite = new ModbusWrite();
modbusWrite.ModbusWrite = modbusWrite;
module.exports = modbusWrite;
