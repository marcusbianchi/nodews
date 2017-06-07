var fs = require('fs');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();
var configObject = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

chai.use(chaiHttp);

describe("Restful API that receives and Process Data.", function() {
	this.timeout(15000);
	var rawdatajson = JSON.parse(fs.readFileSync('test/example-files/rawdata-example.json', 'utf8'));
	var archiveid = "";
	describe("Receives and Process POST data.", function() {
		it("Receives a JSON  POST", function(done) {
			chai.request(server)
				.post('/rawdata')
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
				.post('/rawdata')
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
				.post('/rawdata')
				.send(localrawdata)
				.end(function(err, res) {
					res.should.have.status(400);
					done();
				});
		});
		it("Saves the Raw data file to S3", function(done) {
			var AWS = new require('aws-sdk');
			var options = {
				Bucket: configObject.rawdataapi.s3.rawbucket,
				Key: archiveid.toString() + '.json'
			};
			var s3 = new AWS.S3({
				endpoint: configObject.rawdataapi.s3.endpoint
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
});