/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');

var UserSchema = new mongoose.Schema({
	user: {
		type: String,
		required: true
	},
	email: String,
	mobile_phone: String,
	work_phone: String,
	expired: {
		type: Boolean,
		default: false
	}
});

var User = mongoose.model('User', UserSchema);

UserSchema.pre('save', function (next) {
	var self = this;
	User.findOne({
		user: self.user,
	}, function (err, result) {
		if (err) {
			next(err);
		} else if (result) {
			next(new Error('this user is exists'));
		} else {
			next();
		}
	});
});

var addUser = function (user, config, callback) {
	var newUser = new User({
		user: user
	});
	if (config && config.email) {
		newUser.email = config.email;
	}
	if (config && config.mobile_phone) {
		newUser.modile_phone = config.mobile_phone;
	}
	if (config && config.work_phone) {
		newUser.work_phone = config.work_phone;
	}
	newUser.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback(null, {
				user: newUser.user,
				email: newUser.email,
				mobile_phone: newUser.mobile_phone,
				work_phone: newUser.work_phone
			});
		}
	});
};

var deleteUser = function (user, callback) {
	var query = {user: user};
	User.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when deleteUser, query=' + JSON.stringify(query),
				message: 'No this user',
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

var getUserConfigure = function (user, callback) {
	var query = {user: user};
	User.findOne(query, {user: true, email: true, mobile_phone: true, work_phone: true, "_id": false}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getConfigure, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var setUserConfigure = function (user, config, callback) {
	var set = {},
		query = {
			user: user
		};

	if (config.email) {
		set.email = config.email;
	}
	if (config.mobile_phone) {
		set.mobile_phone = config.mobile_phone;
	}
	if (config.work_phone) {
		set.work_phone = config.work_phone;
	}

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
				user: result.user,
				email: result.email,
				mobile_phone: result.mobile_phone,
				work_phone: result.work_phone
			});
		}
	});
};

module.exports.User = User;

module.exports.addUser = addUser;
module.exports.deleteUser = deleteUser;

module.exports.getUserConfigure = getUserConfigure;
module.exports.setUserConfigure = setUserConfigure;