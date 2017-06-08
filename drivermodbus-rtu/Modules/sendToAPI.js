function SendToAPI() {
               //Importation of the Modules needed to process the information
               var winston = require('winston');
               var request = require('request');
               var fs = require('fs');
 
               //Set the local variables to start the processing
               var retryRate = 1000;
               var urlAPI = "";
 
               /// <summary>Receives the data to send to a the API and the name of the file that originated it</summary>
               /// <param name="fileName" type="String">Full name of the file that has the data on the buffer</param>
               /// <param name="data" type="object">Object containing the Data to Send</param>
               var sendData = function(fileName, data) {
                              request({
                                            url: urlAPI,
                                            method: 'POST',
                                            json: data
                              }, function(error, response, body) {
                                            if (error) {
                                                           winston.info("Send Data Error", error);
                                            } else {
                                                           winston.info("Item Sent to API " + response.statusCode);
                                                           fs.unlink('./buffer/' + fileName, function function_name(error) {
                                                                          if (error) {
                                                                                         winston.error("Remove File Error", error);
                                                                          }
                                                           });
                                            }
                              });
               }
 
               /// <summary>Read a file from the buffer folder and send it to the API</summary>
               /// <param name="fileName" type="String">Full name of the file that has the data on the buffer</param>
               var readFileFromBuffer = function(fileName) {
                              fs.readFile('./buffer/' + fileName, 'utf8', function(error, data) {
                                            if (error) {
                                                           winston.error("Read File Data Error", error);
                                            } else {
                                                                          if(isJSON(data))
                                                                                         sendData(fileName, JSON.parse(data));
                                            }
                              });
               }
 
               /// <summary>Read all the names of the files in the buffer folder and
               /// send them to be read and send to the API </summary>
               var readFromBuffer = function() {
                              fs.readdir('./buffer', function(error, files) {
                                            if (error) {
                                                           winston.error("Read Buffer Error", error);
                                            } else {
                                                           var k =0;
                                                           for (var i = files.length - 1; i >= 0 && k<500; i--) {
                                                                          readFileFromBuffer(files[i]);
                                                                          k = k+1;
                                                           };
                                            };
                              });
               }
 
               /// <summary>Read all the names of the files in the buffer folder and
               /// send them to be read and send to the API </summary>
               var sentController = function() {
                              readFromBuffer();
 
                              setTimeout(sentController, retryRate);
               }
 
function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
               /// <summary>Set the parameters so the system do all the processing</summary>
               /// <param name="newRetryRate" type="Integer">Timer to the attempts to send</param>
               /// <param name="newUrlAPI" type="String">URL of the receiving API</param>
               var setParams = function(newRetryRate, newUrlAPI) {
                              retryRate = newRetryRate;
                              urlAPI = newUrlAPI;
               };
 
               return {
 
                              startController: function(newRetryRate, newUrlAPI) {
                                            setParams(newRetryRate, newUrlAPI);
                                            sentController();
                              }
               }
}
 
var sendToAPI = new SendToAPI();
sendToAPI.SendToAPI = SendToAPI;
module.exports = sendToAPI;