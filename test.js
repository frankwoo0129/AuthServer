/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var moment = require('moment');

process.on('SIGINT', function () {
	console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
	mongoose.disconnect();
	process.exit();
});

//try {
//	throw new Error('test');
//} catch (err) {
//	console.log(err.name);
//	console.log(err.message);
//	console.log(err.fileName);
//	console.log(err.type);
//	console.log(err.lineNumber);
////	console.log('stack:' + err.stack);
//}
//
//var aes = require('./lib/aes');
var random = require('./lib/util').randomString('abcdefghijklmnopqrstuvwxyz');
//var plain = 'hello world123456789012345678901234567890123456789012345678901234567890';
//console.log(aes.encrypt_ctr(plain, random(12)));

mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', function (err) {
	console.log(err);
	process.exit();
});

var TestSchema = new mongoose.Schema({
	id: {
		type: String
	},
	user: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

var Test = mongoose.model('Test', TestSchema);

TestSchema.path('id').validate(function (value, response) {
	var self = this;
	console.log(self);
	response(true);
}, 'Validation of {id} failed');

//var newTest = new Test();
//newTest.id = random(12);
//newTest.save(function (err) {
//	if (err) {
//		console.log(err);
//	} else {
//		console.log(this);
//	}
//});

Test.find({}, {"_id": false, id: true}, function (err, results) {
	if (err) {
		console.log(err);
	} else {
		console.log(results);
	}
});

//var randomString = require('./lib/util').randomString("abcdefghijklmnopqrstuwxyz0123456789", 32);
//
//console.log(randomString());









//EC → WMS倉庫管理系統 = DMS交貨管理系統

//(1)WMS + DMS to 承運商(配達貨態) WMS串SAP 貨態串DMS串EC