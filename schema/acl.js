/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var ACLSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	clientId: {
		type: String,
		required: true
	},
	roles: {
		type: [String]
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});


var ACL = mongoose.model('ACL', ACLSchema);

var getACL = function (clientId, callback) {
	ACL.findOne({
		clientId: clientId
	}, {
		name: true,
		clientId: true,
		roles: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				message: 'no ACL when getACL',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var getRoles = function (clientId, callback) {
	getACL(clientId, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback(null, result.roles);
		}
	});
};

var addRole = function (clientId, rolename, callback) {
	ACL.findOneAndUpdate({
		clientId: clientId
	}, {$addToSet: {
		roles: rolename
	}}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

var deleteRole = function (clientId, rolename, callback) {
	ACL.findOneAndUpdate({
		clientId: clientId
	}, {$pull: {
		roles: rolename
	}}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

var renameRole = function (clientId, oldname, newname, callback) {
	ACL.findOneAndUpdate({
		clientId: clientId,
		roles: {
			$in: [oldname]
		}
	}, {$set: {
		"roles.$": newname
	}}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};