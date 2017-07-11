module.exports = function(app) {
  app.get("/pagamentos", function(req, res) {
    console.log("Recebida Requisição");
    res.send("Ok.");
  });
  apo.post("/pagamentos/pagamento", function(req, res) {
    var pagamento = req.body;
    console.log(pagamento);
    res.send("Ok.");
  });
};
