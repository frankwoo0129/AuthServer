/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');

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
	name: {
		type: String,
		required: true
	},
	os: {
		type: String,
		required: true
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

//ClientSchema.pre('save', function (next) {
//	var self = this;
//	Client.findOne({
//		user: self.owner.user,
//		org: self.owner.org
//	}, function (err, result) {
//		if (err) {
//			next(err);
//		} else if (!result) {
//			next(new Error('No this owner'));
//		} else {
//			next();
//		}
//	});
//});

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

var getClient = function (clientId, callback) {
	var query = {
		id: clientId
	};
	Client.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getClient, query=' + JSON.stringify(query),
				message: 'No this client',
				status: 404
			});
		} else {
			callback(null, {
				id: result.id,
				name: result.name,
				os: result.os,
				version: result.version,
				owner: result.owner
			});
		}
	});
};

var addClient = function (name, os, version, userId, callback) {
//	if (!req.body.app_name) {
//		next({
//			message: 'No \'app_name\'',
//			status: 400
//		});
//	} else if (!req.body.os) {
//		next({
//			message: 'No \'os\'',
//			status: 400
//		});
//	} else if (!req.body.app_version) {
//		next({
//			message: 'No \'app_version\'',
//			status: 400
//		});
//	} else if (!req.body.owner) {
//		next({
//			message: 'No \'owner\'',
//			status: 400
//		});
//	} else if (!req.body.org) {
//		next({
//			message: 'No \'org\'',
//			status: 400
//		});
//	} else {
	var newClient = new Client();
	newClient.name = name;
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
				name: newClient.name,
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
				debug: 'result is Not found when deleteApp, query=' + JSON.stringify(query),
				message: 'No this app',
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
module.exports.getClient = getClient;
module.exports.addClient = addClient;
module.exports.deleteClient = deleteClient;
