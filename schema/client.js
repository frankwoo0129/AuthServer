/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

/*
 *	Main Key:
 *		user
 *		org
 */
var ClientSchema = new mongoose.Schema({
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
	domain: String,
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

var Client = mongoose.model('Client', ClientSchema);

ClientSchema.pre('save', function (next) {
	var self = this;
	Client.findOne({
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

module.exports = Client;
