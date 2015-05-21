/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');
var randomPassword = require('../lib/util').randomString("abcdefghijklmnpqrstuwxyz123456789");

/*
 *	Main Key:
 *		user
 *		org
 */
var UserSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	user: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	org: {
		type: String,
		required: true
	},
	email: String,
	mobile_phone: String,
	work_phone: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expired: {
		type: Boolean,
		default: false
	},
	changePassword: {
		type: Boolean,
		default: true
	}
});

var User = mongoose.model('User', UserSchema);

UserSchema.pre('save', function (next) {
	var self = this;
	User.findOne({
		user: self.user,
		org: self.org
	}, function (err, result) {
		if (err) {
			next(err);
		} else if (result) {
			next(new Error('this user is exists, id=' + result.id));
		} else {
			next();
		}
	});
});

UserSchema.path('id').validate(function (value, response) {
	var self = this;
	User.findOne({
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

var getUserId = function (user, org, callback) {
	var query = {
		user: user,
		org: org
	};
	User.findOne(query,  {
		id: true,
		user: true,
		org: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getUserId, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var getUserIdByOrg = function (org) {
	return function (user, callback) {
		getUserId(user, org, callback);
	};
};

var getUser = function (userId, callback) {
	var query = {
		id: userId
	};
	User.findOne(query, {
		id: true,
		user: true,
		org: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getUser, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var addUser = function (user, org, config, callback) {
	var newUser = new User();
	newUser.user = user;
	newUser.org = org;
	newUser.id = md5.md5sum(JSON.stringify(newUser));
	if (config && config.email) {
		newUser.email = config.email;
	}
	if (config && config.mobile_phone) {
		newUser.modile_phone = config.mobile_phone;
	}
	if (config && config.work_phone) {
		newUser.work_phone = config.work_phone;
	}
	newUser.password = randomPassword(6);
	newUser.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback(null, {
				id: newUser.id,
				user: newUser.user,
				org: newUser.org,
				password: newUser.password,
				email: newUser.email,
				mobile_phone: newUser.mobile_phone,
				work_phone: newUser.work_phone
			});
		}
	});
};

var deleteUser = function (userId, callback) {
	var query = {
		id: userId
	};
	User.findOneAndRemove(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when deleteUser, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var changePassword = function (userId, password, newPassword, callback) {
	var query = {
		id: userId,
		password: password
	};
	User.findOneAndUpdate(query, {
		$set: {
			password: newPassword,
			changePassword: false
		}
	}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when changePassword, query=' + JSON.stringify(query),
				message: 'Auth Error',
				status: 401
			});
		} else {
			callback(null, {
				id: result.id
			});
		}
	});
};

var resetPassword = function (userId, callback) {
	var query = {
		id: userId
	};
	User.findOneAndUpdate(query, {
		$set: {
			password: randomPassword(6),
			changePassword: true
		}
	}, {
		new: true
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when resetPassword, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, {
				id: result.id,
				password: result.password
			});
		}
	});
};

var getUserConfigure = function (userId, callback) {
	var query;
	if (typeof userId === 'object') {
		query = userId;
	} else if (typeof userId === 'string') {
		query = {
			id: userId
		};
	} else {
		callback({
			message: 'no userId when getUserConfigure',
			status: 400
		});
	}
	User.findOne(query, {
		id: true,
		user: true,
		org: true,
		email: true,
		mobile_phone: true,
		work_phone: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getConfigure, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, {
				id: result.id,
				user: result.user,
				org: result.org,
				email: result.email,
				mobile_phone: result.mobile_phone,
				work_phone: result.work_phone
			});
		}
	});
};

var setUserConfigure = function (userId, config, callback) {
	var query = {
		id: userId
	},
		set = {},
		change = false;
		
	if (config.email) {
		set.email = config.email;
		change = true;
	}
	if (config.mobile_phone) {
		set.modile_phone = config.mobile_phone;
		change = true;
	}
	if (config.work_phone) {
		set.work_phone = config.work_phone;
		change = true;
	}
	if (change !== true) {
		callback({
			message: 'No change',
			status: 400
		});
	} else {
		User.findOneAndUpdate(query, {
			$set: set
		}, {
			new: true
		}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback({
					debug: 'result is Not found when changeConfigure, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				callback(null, {
					id: result.id,
					user: result.user,
					org: result.org,
					email: result.email,
					mobile_phone: result.mobile_phone,
					work_phone: result.work_phone
				});
			}
		});
	}
};

module.exports.User = User;

module.exports.resetPassword = resetPassword;
module.exports.changePassword = changePassword;

module.exports.getUserIdByOrg = getUserIdByOrg;
module.exports.getUserId = getUserId;
module.exports.getUser = getUser;
module.exports.addUser = addUser;
module.exports.deleteUser = deleteUser;

module.exports.getUserConfigure = getUserConfigure;
module.exports.setUserConfigure = setUserConfigure;
