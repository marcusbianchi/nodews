var SerialPort = require('serialport').SerialPort;
var modbus = require('modbus-rtu');


var config = JSON.parse(fs.readFileSync('configWrite.json', 'utf8'));

var serialPort = new SerialPort("/" + config.comPortPath, config.comPortConfig);
master = new modbus.Master(serialPort);

master.readHoldingRegisters(config.deviceToWrite, 297, 1).then(function(data) {
        console.log("Reading To " + config.deviceToWrite);
        console.log(data);

        master.writeSingleRegister(config.deviceToWrite, 297, config.valueToWrite).then(function(data) {
            console.log("Writing To " + config.deviceToWrite);
            console.log(data);

            master.readHoldingRegisters(1, 0, 4).then(function(data) {
                console.log("Confirming Value on " + config.deviceToWrite);
                console.log(data);
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });
    },
    function(err) {
        console.log(err);

    });