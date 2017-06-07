var request = require('request');


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function PostData(data) {
	console.log(data);
    request({
        url: 'http://192.168.8.132:8057/api/measureddataobjects', //URL to hit
        method: 'POST',
        json: data        
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(response.statusCode);
        }
    });
}

function generateReading() {
    var dataCapture = {};
    dataCapture.dataSourceID = _deviceID;
    dataCapture.MeasureDataList = [];
    var measurementRSSI = {};
    measurementRSSI.tag = "RSSI";
    measurementRSSI.value = getRandomInt(-60, -40);
    measurementRSSI.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementRSSI);

    var measurementActivePhase1 = {};
    measurementActivePhase1.tag = "Active Energy Consumption, Ph 1";
    measurementActivePhase1.value = (new Date()).getTime();
    measurementActivePhase1.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementActivePhase1);

    var measurementActivePhase2 = {};
    measurementActivePhase2.tag = "Active Energy Consumption, Ph 2";
    measurementActivePhase2.value = (new Date()).getTime();
    measurementActivePhase2.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementActivePhase2);

    var measurementActivePhase3 = {};
    measurementActivePhase3.tag = "Active Energy Consumption, Ph 3";
    measurementActivePhase3.value = (new Date()).getTime();
    measurementActivePhase3.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementActivePhase3);

    var measurementActivePhaseSum = {};
    measurementActivePhaseSum.tag = "Active Energy Consumption SUM";
    measurementActivePhaseSum.value = measurementActivePhase3.value + measurementActivePhase2.value + measurementActivePhase1.value;
    measurementActivePhaseSum.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementActivePhaseSum);

    var measurementReactivePhase1 = {};
    measurementReactivePhase1.tag = "Reactive Energy Consumption, Ph 1";
    measurementReactivePhase1.value = (new Date()).getTime() * 0.1456;
    measurementReactivePhase1.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementReactivePhase1);

    var measurementReactivePhase2 = {};
    measurementReactivePhase2.tag = "Reactive Energy Consumption, Ph 2";
    measurementReactivePhase2.value = (new Date()).getTime() * 0.1456;
    measurementReactivePhase2.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementReactivePhase2);

    var measurementReactivePhase3 = {};
    measurementReactivePhase3.tag = "Reactive Energy Consumption, Ph 3";
    measurementReactivePhase3.value = (new Date()).getTime() * 0.1456;
    measurementReactivePhase3.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementReactivePhase2);

    var measurementReactivePhaseSum = {};
    measurementReactivePhaseSum.tag = "Reactive Energy Consumption SUM";
    measurementReactivePhaseSum.value = measurementReactivePhase1.value + measurementReactivePhase2.value + measurementReactivePhase3.value;
    measurementReactivePhaseSum.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementReactivePhaseSum);

    var measurementApparentPhase1 = {};
    measurementApparentPhase1.tag = "Apparent Energy Consumption, Ph 1";
    measurementApparentPhase1.value = Math.sqrt(Math.pow(measurementActivePhase1.value, 2) + Math.pow(measurementReactivePhase1.value, 2));
    measurementApparentPhase1.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementApparentPhase1);

    var measurementApparentPhase2 = {};
    measurementApparentPhase2.tag = "Apparent Energy Consumption, Ph 2";
    measurementApparentPhase2.value = Math.sqrt(Math.pow(measurementActivePhase1.value, 2) + Math.pow(measurementReactivePhase1.value, 2));
    measurementApparentPhase2.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementApparentPhase2);

    var measurementApparentPhase3 = {};
    measurementApparentPhase3.tag = "Apparent Energy Consumption, Ph 3";
    measurementApparentPhase3.value = Math.sqrt(Math.pow(measurementActivePhase1.value, 2) + Math.pow(measurementReactivePhase1.value, 2));
    measurementApparentPhase3.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementApparentPhase3);

    var measurementApparentPhaseSum = {};
    measurementApparentPhaseSum.tag = "Apparent Energy Consumption SUM";
    measurementApparentPhaseSum.value = measurementApparentPhase3.value + measurementApparentPhase2.value + measurementApparentPhase1.value;
    measurementApparentPhaseSum.timeStampTicks = (new Date()).getTime() * 10000 + 621355968000000000;
    dataCapture.MeasureDataList.push(measurementApparentPhaseSum);
    PostData(dataCapture);
}

var _deviceID = 0;




function generateDevices() {
    for (var deviceID = 100; deviceID < 200; deviceID++) {
    	_deviceID = deviceID
        setTimeout( generateReading,5);
    }
}

generateDevices();

for (var i = 0; i < 50; i++) {	
	setTimeout(generateDevices,600);
}