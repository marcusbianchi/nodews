var express = require("express");
var app = express();
var consign = require("consign");
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
module.exports = function() {
  app.use(expressValidator());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  consign().include("controllers").then("persistencia").into(app);
  return app;
};
