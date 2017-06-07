var fs = require('fs');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();
var configObject = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

chai.use(chaiHttp);

describe("Restful API that receives and reads Events.", function() {
	this.timeout(15000);
	var rawdatajson = JSON.parse(fs.readFileSync('test/example-files/rawdata-example.json', 'utf8'));
	var archiveid = "";
	describe("Receives and Process POST data.", function() {
		it("Receives a JSON  POST", function(done) {
			chai.request(server)
				.post('/event')
				.send(rawdatajson)
				.end(function(err, res) {
					res.should.have.status(200);
					res.body.should.be.a('number');
					archiveid = res.body;
					done();
					if (err) {
						console.log(err);
					}
				});
		});
		it("Refuses JSON with incorrect Data", function(done) {
			var accID = rawdatajson.accountID;
			rawdatajson.accountID = "BANANA";
			chai.request(server)
				.post('/event')
				.send(rawdatajson)
				.end(function(err, res) {
					res.should.have.status(400);
					rawdatajson.accountID = accID;
					done();
				});
		});
		it("Refuses JSON with incomplete Data", function(done) {
			var localrawdata = JSON.parse(fs.readFileSync('test/example-files/rawdata-example.json', 'utf8'));
			delete localrawdata.accountID;
			chai.request(server)
				.post('/event')
				.send(localrawdata)
				.end(function(err, res) {
					res.should.have.status(400);
					done();
				});
		});
		it("Saves the Event file to S3 in a folder for each company", function(done) {
			var AWS = new require('aws-sdk');
			var options = {
				Bucket: configObject.eventapi.s3.eventbucket,
				Key: archiveid.toString() + '.json'
			};
			var s3 = new AWS.S3({
				endpoint: configObject.eventapi.s3.endpoint
			});
			s3.getObject(options, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					jsondata = JSON.parse(data.Body.toString('utf8'));
					jsondata.companyID.should.be.equals(rawdatajson.companyID);
					jsondata.accountID.should.be.equals(rawdatajson.accountID);
					jsondata.dataSourceID.should.be.equals(rawdatajson.dataSourceID);
					done();
				}
			});
		});
	});
	describe("Receives and Process GET Data.", function() {
		var companyID = "01";
		describe("Get All itens from a Company.", function() {
			it("Returns a list of JSON containg all the machines of a company.", function(done) {
				chai.request(server)
					.get('/event/' + companyID)
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
					.get('/event/' + companyID + "/" + equipmentID)
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
					.get('/event/' + companyID + "/" + 0)
					.end(function(err, res) {
						res.should.have.status(400);
						done();
					});
			});
		});
	});
});