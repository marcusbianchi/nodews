var app = require("./config/custom-express")();

app.listen(3000, function() {
  console.log("Listening on port 3000");
});
