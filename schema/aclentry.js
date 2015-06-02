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

var ACLEntry = mongoose.model('ACLEntry', ACLEntrySchema);

var createACLEntry = function (clientId, name, callback) {
	var entry = new ACLEntry();
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

var removeACLEntry = function (clientId, name, callback) {
	ACLEntry.findOneAndRemove({
		clientId: clientId,
		name: name
	}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

var isRoleEnable = function (clientId, name, role, callback) {
	ACLEntry.findOne({
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

var enableRole = function (clientId, name, role, callback) {
	ACLEntry.findOneAndUpdate({
		clientId: clientId,
		name: name
	}, {$addToSet: {
		roles: role
	}}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				message: '',
				status: 400
			});
		} else {
			callback();
		}
	});
};

var disableRole = function (clientId, name, role, callback) {
	ACLEntry.findOneAndUpdate({
		clientId: clientId,
		name: name
	}, {$pull: {
		roles: role
	}}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				message: '',
				status: 400
			});
		} else {
			callback();
		}
	});
};

var getAllEntry = function (clientId, callback) {
	ACLEntry.find({
		clientId: clientId
	}, {
		name: true,
		"_id": false
	}, function (err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, results);
		}
	});
};

var getEntry = function (clientId, name, callback) {
	ACLEntry.findOne({
		clientId: clientId,
		name: name
	}, {
		"_id": false,
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

var rename = function (clientId, oldname, newname, callback) {
	
};

var setLevel = function (clientId, name, level, callback) {
	
};

var setDescription = function (clientId, name, description, callback) {
	
};

module.exports.ACLEntry = ACLEntry;
