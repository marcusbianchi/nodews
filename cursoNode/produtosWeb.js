var http = require("http");

var server = http.createServer(function(req, res) {
  res.end("listando os produtos");
});
server.listen(3000);

console.log("server is online");
