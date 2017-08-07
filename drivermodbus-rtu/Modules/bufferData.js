function BufferData() {

    //Importation of the Modules needed to process the information
    var winston = require('winston');
    var fs = require('fs');

    return {
        bufferData: function(data) {
            var currentDate = new Date().getTime();
            fs.writeFile("./buffer/" + data.dataSourceID + "-" + currentDate + ".json", JSON.stringify(data), function(err) {
                if (err) {
                    winston.error("Buffer Data Error", err);
                } else {
                    //winston.info("Item Added to Buffer");
                }
            })
        }
    }
}

var bufferData = new BufferData();
bufferData.BufferData = BufferData;
module.exports = bufferData;