var fs = require('fs');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();

chai.use(chaiHttp);

describe("Restful API to Access the machines.", function() {
	this.timeout(15000);
	var equipmentID = "";
	var machineJson = JSON.parse(fs.readFileSync('test/example-files/machine-example.json', 'utf8'));
	describe("Receives and Process POST data.", function() {
		it("Receives a JSON  POST", function(done) {
			chai.request(server)
				.post('/machines')
				.send(machineJson)
				.end(function(err, res) {
					res.should.have.status(200);
					done();
					if (err) {
						console.log(err);
					}
				});
		});
		it("Refuses JSON with EquipmentID.", function(done) {
			machineJson.equipmentID = "1";
			chai.request(server)
				.post('/machines')
				.send(machineJson)
				.end(function(err, res) {
					res.should.have.status(400);
					done();
					delete machineJson.equipmentID;
				});
		});
		it("Refuses if lenght of AnyField is 0", function(done) {
			var companyID = machineJson.companyID;
			machineJson.companyID = "";
			chai.request(server)
				.post('/machines')
				.send(machineJson)
				.end(function(err, res) {
					res.should.have.status(400);
					done();
					machineJson.companyID = companyID;
				});
		});
		it("Refuses if the Format is Incorrect", function(done) {
			chai.request(server)
				.post('/machines')
				.send('Banana')
				.end(function(err, res) {
					res.should.have.status(400);
					done();
				});
		});
		it("Returns a JSON once saved in the DB.", function(done) {
			chai.request(server)
				.post('/machines')
				.send(machineJson)
				.end(function(err, res) {
					res.should.have.status(200);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.have.property('equipmentID');
					res.body.equipmentID.should.be.a('string');
					res.body.equipmentID.should.be.not.empty;
					equipmentID = res.body.equipmentID;
					done();
				});
		});
	});
	describe("Receives and Process GET Data.", function() {
		var companyID = "1";
		describe("Get All itens from a Company.", function() {
			it("Returns a list of JSON containg all the machines of a company.", function(done) {
				chai.request(server)
					.get('/machines/' + companyID)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.instanceof(Array)
							.and.have.length.above(0);
						res.body[0].should.be.a('object');
						res.body[0].should.have.property('equipmentID');
						res.body[0].equipmentID.should.be.a('string');
						res.body[0].equipmentID.should.be.not.empty;
						done();
					});
			});

		});
		describe("Get on item from specific ID.", function() {
			var companyID = "1";
			it("Returns a JSON containing the expecific Machine.", function(done) {
				chai.request(server)
					.get('/machines/' + companyID + "/" + equipmentID)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object');
						res.body.should.be.property('equipmentID');
						res.body.equipmentID.should.be.a('string');
						res.body.equipmentID.should.be.equal(equipmentID);
						done();
					});
			});
			it("Returns null if the machine doesnt exist.", function(done) {
				chai.request(server)
					.get('/machines/' + companyID + "/" + 0)
					.end(function(err, res) {
						res.should.have.status(400);
						done();
					});
			});
		});
	});
	describe("Update an Item based on his ID and Company ID.", function() {
		var companyID = "1";
		machineJson.group = "banana";
		describe("Update Existing Item", function() {
			it("Update and Item on the Database and return the JSON of the Item", function(done) {
				chai.request(server)
					.put('/machines/' + companyID + "/" + equipmentID)
					.send(machineJson)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object');
						res.body.should.be.property('equipmentID');
						res.body.equipmentID.should.be.a('string');
						res.body.equipmentID.should.be.equal(equipmentID);
						res.body.should.be.property('group');
						res.body.group.should.be.a('string');
						res.body.group.should.be.equal("banana");
						done();
					});
			});
		});
	});
	describe("Delete an Item based on his ID and Company ID.", function() {
		var companyID = "1";
		describe("Delete Existing Item", function() {
			it("Delete and Item on the Database and return a validation Message", function(done) {
				chai.request(server)
					.del('/machines/' + companyID + "/" + equipmentID)
					.send(machineJson)
					.end(function(err, res) {
						res.should.have.status(200);
						done();
					});
			});
		});
	});
});