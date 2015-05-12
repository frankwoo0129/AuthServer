/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var Client = require('./client').Client;
var User = require('./user').User;

/*
 *	Main Key:
 *		device_id
 *		client_id
 */
var GrantTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	clientSecret: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 30 * 3
	}
});

var GrantToken = mongoose.model('GrantToken', GrantTokenSchema);

GrantTokenSchema.path('id').validate(function (value, response) {
	GrantToken.findOne({
		id: value
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (!result) {
			response(true);
		} else {
			response(false);
		}
	});
}, 'Validation of {id} failed');

GrantTokenSchema.path('clientId').validate(function (value, response) {
	Client.findOne({
		id: value,
		expired: false
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (!result) {
			response(false);
		} else {
			response(true);
		}
	});
}, 'Validation of {clientId} failed');

GrantTokenSchema.path('userId').validate(function (value, response) {
	var self = this;
	User.findOne({
		id: value,
		expired: false
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (!result) {
			response(false);
		} else {
			response(true);
		}
	});
}, 'Validation of {userId} failed');

GrantTokenSchema.pre('save', function (next) {
	var self = this;
	GrantToken.findOneAndRemove({
		clientId: self.clientId,
		clientSecret: self.clientSecret
	}, function (err, result) {
		if (err) {
			next(err);
		} else {
			next();
		}
	});
});

module.exports = GrantToken;
