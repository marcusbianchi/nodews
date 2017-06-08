function ModbusWrite() {
	//Importation of the Modules needed to process the information
	var SerialPort = require('serialport');
	var modbus = require('modbus-rtu');
	var Promise = require("bluebird");
	var winston = require('winston');
	var constants = require('modbus-rtu/constants');


	function writeReadInterval(deviceList, master, defaultTime, callback) {
		promises = [];
		for (var i = 0; i < deviceList.length; i++) {
			promises.push(writeReadIntervalToDevice(deviceList[i].deviceID, master, defaultTime));			
			}

			Promise.all(promises).then(function(results) {		
			
			}).catch(function(err) {
				winston.error(err)
			}).then(function() {
				
				setTimeout(function(){
					winston.info('CALLBACK');
			callback();
			}, 20*60 * 1000);
				
			});
		}

		function writeReadIntervalToDevice(deviceID, master, defaultTime) {
			this.deviceID = deviceID;
			winston.info(' Atualizando Tempo De leitura Para ' + deviceID);
			return master.writeSingleRegister(deviceID, 297, defaultTime,retryCount=3).then(function() {
				winston.info('Tempo De leitura Para ' + deviceID+' Atualizado com Sucesso');
				return 'Tempo De leitura Para ' + deviceID+' Atualizado com Sucesso';
			}, function(err
			) {
					winston.error('Tempo De leitura Para ' + deviceID+' não Atualizado com Sucesso');
				return 'Tempo De leitura Para ' + deviceID+' não Atualizado com Sucesso'
			});
		}

		return {
			writeTimers: function(deviceList, master, defaultTime, callback) {
				master._options.responseTimeout = 60000;	
				master._options.endPacketTimeout = 1000;
				master._options.queueTimeout = 200;
				
				writeReadInterval(deviceList, master, defaultTime, callback);
			}
		}
	}

	var modbusWrite = new ModbusWrite();
	modbusWrite.ModbusWrite = ModbusWrite;
	module.exports = modbusWrite;