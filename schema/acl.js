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
		type: [String],
		default: []
	},
	createdAt: {
		type: Date,
		default: Date.now,
	}
});


var ACL = mongoose.model('ACL', ACLSchema);

var getACL = function (clientId, callback) {
	ACL.findOne({
		clientId: clientId
	}, {
		clientId: true,
		name: true,
		roles: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'no ACL when getACL',
				message: 'no this clientId ACL',
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
	}, {
		$addToSet: {
			roles: rolename
		}
	}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				message: 'No change when addRole',
				status: 400
			});
		} else {
			callback();
		}
	});
};

var deleteRole = function (clientId, rolename, callback) {
	ACL.findOneAndUpdate({
		clientId: clientId
	}, {
		$pull: {
			roles: rolename
		}
	}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				message: 'No change when deleteRole',
				status: 400
			});
		} else {
			callback();
		}
	});
};

var deleteAllRole = function (clientId, callback) {
	ACL.findOneAndUpdate({
		clientId: clientId
	}, {
		$set : {
			roles: []
		}
	}, {
		new : true
	}, function (err, result) {
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
	}, {
		$set: {
			"roles.$": newname
		}
	}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: '',
				message: 'No change when renameRole',
				status: 400
			});
		} else {
			callback();
		}
	});
};