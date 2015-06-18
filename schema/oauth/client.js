/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');
var random = require('../lib/util').randomString('abcdefghijklmnopqrstuvwxyz0123456789', 32);

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
	owner: {
		type: mongoose.Schema.Types.Mixed,
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

ClientSchema.statics.generateId = function (name, type, os, version, callback) {
	var plain = {
		name: name,
		type: type,
		os: os,
		version: version,
		createdAt: new Date()
	},
		id = md5.md5sum(JSON.stringify(plain));
	this.findOne({id: id}, function (err, result) {
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
	this.find({}, {
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
	this.findOne(query, {
		id: true,
		name: true,
		type: true,
		os: true,
		version: true,
		expired: true,
		owner: true,
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

ClientSchema.statics.addClient = function (name, type, os, version, userId, callback) {
	ClientSchema.statics.generateId(name, type, os, version, function (err, id) {
		var newClient = this.call();
		newClient.name = name;
		newClient.type = type;
		if (type === 'web') {
			newClient.secret = random();
		}
		newClient.os = os;
		newClient.version = version;
		newClient.id = id;
		newClient.owner = userId;

		newClient.save(function (err) {
			if (err) {
				callback(err);
			} else {
				callback(null, {
					clientId: newClient.id,
					clientSecret: newClient.secret,
					name: newClient.name,
					type: newClient.type,
					version: newClient.version,
					os: newClient.os,
					owner: newClient.owner
				});
			}
		});
	});
};

ClientSchema.statics.deleteClient = function (clientId, callback) {
	var query = {id: clientId};
	this.findOne(query, function (err, result) {
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

module.exports = function (connection) {
	var Client = connection.model('Client', ClientSchema);

	ClientSchema.pre('save', function (next) {
		var self = this;
		Client.findOne({
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

	return Client;
};
