module.exports = function(app) {
  app.get("/produtos", function(req, res) {
    var connection = app.infra.connectionFactory();

    connection.query("select * from produtos", function(err, results) {
      if (err) console.log(err);
      res.render("produtos/lista", { lista: results });
    });

    connection.end();
  });
};
