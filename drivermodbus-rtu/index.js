var fs = require("fs");
var sendToAPI = require("./Modules/sendToAPI");
var modbusRead = require("./Modules/modbusRead");
var instantConsumption = require("./Modules/instantConsumption");
var winston = require("winston");
var Datastore = require("nedb"),
  db = new Datastore();
var SerialPort = require("serialport");
var ModbusMaster = require("modbus-rtu").ModbusMaster;

//Configure Winston to save only errors to a log file
winston.add(winston.transports.File, {
  filename: "../Log/driverlog.txt",
  json: false,
  level: "error"
});
winston.remove(winston.transports.Console);
winston.handleExceptions(
  new winston.transports.File({ filename: "../Log/exceptions.txt" })
);
winston.add(winston.transports.Console, { timestamp: true });

var config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var devicesConfig = fs.readdirSync("./Devices/");
deviceList = [];
for (var i = 0; i < devicesConfig.length; i++) {
  var obj = JSON.parse(
    fs.readFileSync("./Devices/" + devicesConfig[i], "utf8")
  );
  if (obj.deviceList) {
    for (var j = obj.deviceList.length - 1; j >= 0; j--) {
      obj.deviceID = obj.deviceList[j];
      var outobj = JSON.parse(JSON.stringify(obj));
      delete outobj.deviceList;
      deviceList.push(outobj);
    }
  } else deviceList.push(JSON.parse(JSON.stringify(obj)));
}
var serialPort = new SerialPort("/" + config.comPortPath, config.comPortConfig);
var master = new ModbusMaster(serialPort, {
  responseTimeout: config.responseTimeout
});
startRead();
if (config.enableServiceSend) {
  sendToAPI.startController(config.retryTime, config.serviceAPI);
}
instantConsumption.calculateInstantConsumption(config, deviceList);

function startRead() {
  modbusRead.startRead(
    deviceList,
    config.comPortPath,
    config.comPortConfig,
    config.readRate,
    config.endPacketTimeout,
    config.responseTimeout,
    db,
    master
  );
}
