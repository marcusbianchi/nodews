module.exports = function(app) {
  app.get("/pagamentos", function(req, res) {
    console.log("Recebida Requisição");
    res.send("Ok.");
  });

  app.put("/pagamentos/pagamento/:id", function(req, res) {
    var pagamento = {};
    var id = req.params.id;
    pagamento.id = id;
    pagamento.status = "CONFIRMADO";
    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    pagamentoDao.atualiza(pagamento, function(erro) {
      if (erro) {
        res.status(500).send(erro);
        return;
      }
      console.log("pagamento criado");
      res.send(pagamento);
    });
  });

  app.post("/pagamentos/pagamento", function(req, res) {
    var pagamento = req.body;
    console.log("processando pagamento...");

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    req
      .assert("forma_de_pagamento", "Forma de pagamento é obrigatória.")
      .notEmpty();
    req
      .assert("valor", "Valor é obrigatório e deve ser um decimal.")
      .notEmpty()
      .isFloat();
    req
      .assert("moeda", "Moeda é obrigatória e deve ter 3 caracteres")
      .notEmpty()
      .len(3, 3);

    if (errors) {
      console.log("Erros de validação encontrados");
      res.status(400).send(errors);
      return;
    }
    var errors = req.validationErrors();
    pagamento.status = "CRIADO";
    pagamento.data = new Date();
    pagamentoDao.salva(pagamento, function(exception, result) {
      if (erro) {
        res.status(500).send(erro);
      }
      res.location("/pagamentos/pagamento/" + resultado.insertId);
      pagamento.id = resultado.insertId;

      console.log("pagamento criado: " + result);
      res.status(201).json(pagamento);
    });
  });

  app.delete("/pagamentos/pagamento/:id", function(req, res) {
    var pagamento = {};
    var id = req.params.id;
    pagamento.id = id;
    pagamento.status = "CANCELADO";
    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    pagamentoDao.atualiza(pagamento, function(erro) {
      if (erro) {
        res.status(500).send(erro);
        return;
      }
      console.log("pagamento cancelado");
      res.status(204).send(pagamento);
    });
  });
};
