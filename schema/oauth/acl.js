/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var async = require('async');

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

module.exports = function (connection) {
	ACLSchema.statics.createACL = function (clientId, name, callback) {
		connection.model('ACL').findOne({
			clientId: clientId
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (result) {
				callback({
					debug: 'when createACL',
					message: 'this clientId ACL is exists',
					status: 400
				});
			} else {
				var ACL = connection.model('ACL'),
					acl = new ACL();

				acl.clientId = clientId;
				acl.name = name;
				acl.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback(null, {
							name: acl.name,
							clientId: acl.clientId,
							roles: acl.roles
						});
					}
				});
			}
		});
	};

	ACLSchema.statics.removeACL = function (clientId, callback) {
		connection.model('ACL').findOne({
			clientId: clientId
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback({
					debug: 'no ACL when removeACL',
					message: 'no this clientId ACL',
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

	ACLSchema.statics.getAllACL = function (callback) {
		connection.model('ACL').find({}, {
			clientId: true,
			name: true,
			roles: true,
			"_id": false
		}, function (err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, results);
			}
		});
	};

	ACLSchema.statics.getACL = function (clientId, callback) {
		connection.model('ACL').findOne({
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
				connection.model('Client').findOne({id: clientId}, function (err, result_client) {
					if (err) {
						callback(err);
					} else if (!result_client) {
						callback({
							debug: 'no ACL when getACL',
							message: 'no this clientId',
							status: 404
						});
					} else {
						ACLSchema.statics.createACL(result_client.id, result_client.name, callback);
					}
				});
			} else {
				callback(null, result);
			}
		});
	};

	ACLSchema.statics.getRoles = function (clientId, callback) {
		ACLSchema.statics.getACL(clientId, function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, result.roles);
			}
		});
	};

	ACLSchema.statics.addRole = function (clientId, rolename, callback) {
		connection.model('ACL').findOneAndUpdate({
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

	ACLSchema.statics.deleteRole = function (clientId, rolename, callback) {
		connection.model('ACL').findOneAndUpdate({
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

	ACLSchema.statics.deleteAllRole = function (clientId, callback) {
		connection.model('ACL').findOneAndUpdate({
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

	ACLSchema.statics.renameRole = function (clientId, oldname, newname, callback) {
		connection.model('ACL').findOneAndUpdate({
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

	var ACL = connection.model('ACL', ACLSchema);
	return ACL;
};
