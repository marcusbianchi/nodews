var mysql = require("mysql");

function createDbConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "casadocodigo_nodejs",
    insecureAuth: true
  });
}

module.exports = function() {
  return createDbConnection;
};
