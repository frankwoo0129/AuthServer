/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

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

module.exports = function (connection) {
	UserSchema.pre('save', function (next) {
		var self = this;
		connection.model('User').findOne({
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

	UserSchema.statics.getUserConfigure = function (user, callback) {
		var query = {user: user};
		connection.model('User').findOne(query, {user: true, email: true, mobile_phone: true, work_phone: true, "_id": false}, function (err, result) {
			if (err) {
				callback(err);
			} else if (result) {
				callback(null, result);
			} else {
				callback(null, null);
			}
		});
	};

	UserSchema.statics.setUserConfigure = function (user, config, callback) {
		var set = {},
			query = {
				user: user
			};

		connection.model('User').findOne(query, {user: true, email: true, mobile_phone: true, work_phone: true, "_id": false}, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				var User = connection.model('User'),
					newUser = new User({
						user: user,
						email: (config) ? config.email : undefined,
						mobile_phone: (config) ? config.mobile_phone : undefined,
						work_phone: (config) ? config.work_phone : undefined
					});
				newUser.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback(null, newUser);
					}
				});
			} else if (config) {
				if (config.email) {
					result.email = config.email;
				}
				if (config.mobile_phone) {
					result.mobile_phone = config.mobile_phone;
				}
				if (config.work_phone) {
					result.work_phone = config.work_phone;
				}
				result.save(function (err) {
					if (err) {
						callback(err);
					} else {
						callback(null, result);
					}
				});
			} else {
				callback({
					message: 'no change',
					status: '400'
				});
			}
		});
	};

	var User = connection.model('User', UserSchema);
	return User;
};
