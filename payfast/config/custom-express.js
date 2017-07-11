var express = require("express");
var app = express();
var consign = require("consign");
var bodyParser = require("body-parser");

module.exports = function() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  consign().include("controllers").into(app);
  return app;
};
