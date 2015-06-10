/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var mongodb = require('mongodb');

var authenticate = function (username, password, org, callback) {
	var MongoClient = require('mongodb').MongoClient,
		url = 'mongodb://localhost:27017/' + org;
	
	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('connection error');
			callback(err);
		} else {
			db.authenticate(username, password, function (err, result) {
				if (err) {
					console.log('authenticate error');
					callback(err);
				} else {
					console.log('result: ' + result);
					db.collection('system.users', function (err, coll) {
						coll.find().toArray(function (err, docs) {
							if (err) {
								callback(err);
							} else {
								console.log(docs);
								callback();
							}
							db.close();
						});
					});
				}
			});
		}
	});
};
