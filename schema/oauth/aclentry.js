/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var ACLLEVEL = [
	'NOACCESS',
	'DEPOSITOR',
	'READER',
	'AUTHOR',
	'EDITOR',
	'DESIGNER',
	'MANAGER'
];

var ACLTYPE = [
	'GROUP',
	'PERSON'
];

var ACLEntrySchema = new mongoose.Schema({
	clientId: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	roles: {
		type: [String],
		default: []
	},
	members: {
		type: [Object],
		default: []
	},
	description: String,
	level: {
		type: Number,
		default: 0
	}
});

module.exports = function (connection) {
	ACLEntrySchema.statics.createACLEntry = function (clientId, name, callback) {
		var ACLEntry = connection.model('ACLEntry'),
			entry = new ACLEntry();
		entry.clientId = clientId;
		entry.name = name;
		entry.save(function (err) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	};

	ACLEntrySchema.statics.removeACLEntry = function (clientId, name, callback) {
		connection.model('ACLEntry').findOne({
			clientId: clientId,
			name: name
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
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

	ACLEntrySchema.statics.rename = function (clientId, oldname, newname, callback) {
		connection.model('ACLEntry').findOne({
			clientId: clientId,
			name: oldname
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
			} else {
				result.name = newname;
				result.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			}
		});
	};

	ACLEntrySchema.statics.isRoleEnable = function (clientId, name, role, callback) {
		connection.model('ACLEntry').findOne({
			clientId: clientId,
			name: name,
			roles: {
				$in: [role]
			}
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (result) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
	};

	ACLEntrySchema.statics.enableRole = function (clientId, name, role, callback) {
		connection.model('ACLEntry').findOneAndUpdate({
			clientId: clientId,
			name: name
		}, {
			$addToSet: {
				roles: role
			}
		}, {
			new: true
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
			} else {
				callback();
			}
		});
	};

	ACLEntrySchema.statics.disableRole = function (clientId, name, role, callback) {
		connection.model('ACLEntry').findOneAndUpdate({
			clientId: clientId,
			name: name
		}, {
			$pull: {
				roles: role
			}
		}, {
			new: true
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
			} else {
				callback();
			}
		});
	};

	ACLEntrySchema.statics.setEntryLevel = function (clientId, name, level, callback) {
		connection.model('ACLEntry').findOneAndUpdate({
			clientId: clientId,
			name: name
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
			} else {
				result.level = level;
				result.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			}
		});
	};

	ACLEntrySchema.statics.setEntryDescription = function (clientId, name, description, callback) {
		connection.model('ACLEntry').findOneAndUpdate({
			clientId: clientId,
			name: name
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				// TODO
				callback({});
			} else {
				result.level = description;
				result.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			}
		});
	};

	ACLEntrySchema.statics.getAllEntry = function (clientId, callback) {
		connection.model('ACLEntry').find({
			clientId: clientId
		}, {
			name: true,
			description: true,
			"_id": false
		}, function (err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, results);
			}
		});
	};

	ACLEntrySchema.statics.getEntry = function (clientId, name, callback) {
		connection.model('ACLEntry').findOne({
			clientId: clientId,
			name: name
		}, {
			"_id": false,
			clientId: true,
			name: true,
			level: true,
			roles: true,
			members: true,
			description: true
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback({
					message: 'No this entry',
					status: 404
				});
			} else {
				callback(null, result);
			}
		});
	};

	var ACLEntry = connection.model('ACLEntry', ACLEntrySchema);
	return ACLEntry;
};
