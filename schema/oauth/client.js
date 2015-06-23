/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5sum = require('../../lib/util').md5sum;
var random = require('../../lib/util').randomString('abcdefghijklmnopqrstuvwxyz0123456789', 32);

var type = ['web', 'mobile', 'task'];
var os = ['ios', 'android'];

var ClientSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	secret: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	type: {
		type: String
	},
	os: {
		type: String
	},
	version: {
		type: String,
		required: true
	},
	expired: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = function (connection) {
	ClientSchema.pre('save', function (next) {
		var self = this;
		connection.model('Client').findOne({
			name: self.name,
			type: self.type,
			os: self.os,
			version: self.version
		}, function (err, result) {
			if (err) {
				next(err);
			} else if (result) {
				next(new Error('It already exists, clientId=' + result.id));
			} else {
				next();
			}
		});
	});

	ClientSchema.statics.generateId = function (name, type, os, version, callback) {
		var plain = {
			name: name,
			type: type,
			os: os,
			version: version,
			createdAt: new Date()
		},
			id = md5sum(JSON.stringify(plain));
		connection.model('Client').findOne({id: id}, function (err, result) {
			if (err) {
				callback(err);
			} else if (result) {
				setTimeout(function () {
					ClientSchema.statics.generateId(name, type, os, version, callback);
				}, 100);
			} else {
				callback(null, id);
			}
		});
	};

	ClientSchema.statics.getAllClient = function (callback) {
		connection.model('Client').find({}, {
			id: true,
			name: true,
			type: true,
			os: true,
			version: true,
			expired: true,
			"_id": false
		}, function (err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, results);
			}
		});
	};

	ClientSchema.statics.getClient = function (clientId, callback) {
		var query = {id: clientId};
		connection.model('Client').findOne(query, {
			id: true,
			name: true,
			type: true,
			os: true,
			version: true,
			expired: true,
			"_id": false
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback({
					debug: 'result is Not found when getClient, query=' + JSON.stringify(query),
					message: 'No this client',
					status: 404
				});
			} else {
				callback(null, result);
			}
		});
	};

	ClientSchema.statics.addClient = function (name, type, os, version, callback) {
		ClientSchema.statics.generateId(name, type, os, version, function (err, id) {
			var Client = connection.model('Client'),
				newClient = new Client();
			newClient.name = name;
			newClient.type = type;
			if (type === 'web') {
				newClient.secret = random();
			}
			newClient.os = os;
			newClient.version = version;
			newClient.id = id;

			newClient.save(function (err) {
				if (err) {
					callback(err);
				} else {
					callback(null, {
						clientId: newClient.id,
						clientSecret: newClient.secret,
						name: newClient.name,
						type: newClient.type,
						os: newClient.os,
						version: newClient.version
					});
				}
			});
		});
	};

	ClientSchema.statics.deleteClient = function (clientId, callback) {
		var query = {id: clientId};
		connection.model('Client').findOne(query, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback({
					debug: 'result is Not found when deleteClient, query=' + JSON.stringify(query),
					message: 'No this client',
					status: 404
				});
			} else {
				result.remove(function (err) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			}
		});
	};

	var Client = connection.model('Client', ClientSchema);
	return Client;
};
