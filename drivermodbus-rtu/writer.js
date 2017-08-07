var SerialPort = require("serialport");
var modbus = require("modbus-rtu");
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("configWrite.json", "utf8"));
var ok = [];
var nok = [];
var samplingok = [];

var serialPort = new SerialPort("/" + config.comPortPath, config.comPortConfig);
master = new modbus.Master(serialPort);
console.log("Start Device " + config.deviceToWrite);
config.deviceToWrite.forEach(function(deviceId) {
  master.writeSingleRegister(deviceId, 349, 3000, 1).then(
    function(data) {
      console.log("Writing Sampling to " + deviceId);
      console.log("------------------------------------------");
    },
    function(err) {
      console.log(err);
    }
  );

  master.readHoldingRegisters(deviceId, 222, 1).then(
    function(data) {
      console.log("Reading Sampling on " + deviceId);
      console.log(data);
      console.log("------------------------------------------");
      if (data[0] === 3000) samplingok.push(deviceId);
    },
    function(err) {
      console.log(err);
    }
  );

  master.writeSingleRegister(deviceId, 298, 4660, 1).then(
    function(data) {
      console.log("Writing Password to " + deviceId);
      console.log("------------------------------------------");
    },
    function(err) {
      console.log(err);
    }
  );

  master.readHoldingRegisters(deviceId, 298, 1).then(
    function(data) {
      console.log("Reading Password to " + deviceId);
      console.log(data);
      console.log("------------------------------------------");
    },
    function(err) {
      console.log(err);
    }
  );

  master.readHoldingRegisters(deviceId, 297, 1).then(
    function(data) {
      console.log("Reading Value on " + deviceId);
      console.log("------------------------------------------");
    },
    function(err) {
      console.log(err);
    }
  );

  master.writeSingleRegister(deviceId, 297, config.valueToWrite, 1).then(
    function(data) {
      console.log("Writing To " + deviceId);
      console.log("------------------------------------------");
    },
    function(err) {
      console.log(err);
    }
  );

  master.readHoldingRegisters(deviceId, 297, 1).then(
    function(data) {
      console.log("Confirming Value on " + deviceId);
      console.log(data);
      console.log("------------------------------------------");
      ok.push(deviceId);
    },
    function(err) {
      console.log(err);
    }
  );

  master.readHoldingRegisters(deviceId, 24, 3).then(
    function(data) {
      console.log("TimeStamp on " + deviceId);
      console.log(data);
      console.log("------------------------------------------");
      ok.push(deviceId);
      console.log("OK: " + ok);
      console.log("NOK: " + nok);
      console.log("Sampling OK: " + samplingok);
    },
    function(err) {
      console.log(err);
      nok.push(deviceId);
      console.log("OK: " + ok);
      console.log("NOK: " + nok);
      console.log("Sampling OK: " + samplingok);
    }
  );
});
