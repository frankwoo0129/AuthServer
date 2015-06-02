/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');
var random = require('../lib/util').randomString('abcdefghijklmnopqrstuvwxyz0123456789', 32);

var type = ['web', 'mobile', 'task'];
var os = ['ios', 'android'];

/*
 *	Main Key:
 *		name
 *		os
 *		version
 */
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

var Client = mongoose.model('Client', ClientSchema);

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

ClientSchema.path('id').validate(function (value, response) {
	var self = this;
	Client.findOne({
		id: value
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (result) {
			response(false);
		} else {
			response(true);
		}
	});
}, 'Validation of {id} failed');

var getAllClient = function (callback) {
	Client.find({}, {
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

var getClient = function (clientId, callback) {
	var query = {
		id: clientId
	};
	Client.findOne(query, {
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

var addClient = function (name, type, os, version, userId, callback) {
	var newClient = new Client();
	newClient.name = name;
	newClient.type = type;
	if (type === 'web') {
		newClient.secret = random();
	}
	newClient.os = os;
	newClient.version = version;
	newClient.id = md5.md5sum(JSON.stringify(newClient));
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
};

var deleteClient = function (clientId, callback) {
	var query = {
		id: clientId
	};
	Client.findOneAndRemove(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when deleteClient, query=' + JSON.stringify(query),
				message: 'No this client',
				status: 404
			});
		} else {
			callback(null, {
				clientId: result.id,
				name: result.name,
				os: result.os,
				version: result.version,
				owner: result.owner
			});
		}
	});
};

module.exports.Client = Client;
module.exports.getAllClient = getAllClient;
module.exports.getClient = getClient;
module.exports.addClient = addClient;
module.exports.deleteClient = deleteClient;
