var express = require("express");
var app = express();
var consign = require("consign");

module.exports = function() {
  consign().include("controllers").into(app);
  return app;
};
