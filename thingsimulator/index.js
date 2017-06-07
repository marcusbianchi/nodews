var request = require('request');

for (var i = 100; i < 200; i++) {
    var thing = {};
    thing.Characteristics = [];
    thing.thingId = i;
    thing.code = "MD-" + i;
    thing.name = "Temperado";
    thing.status = "active";
    thing.description = "Medidores " + i;
    thing.parentThingId = 4;
    thing.thingLvlDescription = "Medidores";
    thing.thingLvl = 1;
    thing.thingType = null;
    thing.physicalConn = i;
    thing.position = 1;

    PostData(thing);

}


function PostData(data) {
    console.log(data);
    request({
        url: 'http://192.168.8.132:8032/api/things/', //URL to hit
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
