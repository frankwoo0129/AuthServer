/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var User = require('./user').User;
var Client = require('./client').Client;

var AccessTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	userId: {
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
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24
	},
	expires: {
		type: Number
	}
});

var AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

AccessTokenSchema.path('id').validate(function (value, response) {
	AccessToken.findOne({
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

AccessTokenSchema.path('clientId').validate(function (value, response) {
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

AccessTokenSchema.path('userId').validate(function (value, response) {
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

module.exports = AccessToken;
