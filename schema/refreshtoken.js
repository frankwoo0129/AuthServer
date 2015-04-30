/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var Client = require('./client');
var User = require('./user');

var RefreshTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	clientId: {
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
		expires: 60 * 60 * 24
	}
});

var RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

RefreshTokenSchema.path('id').validate(function (value, response) {
	RefreshToken.findOne({
		id: value,
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (!result) {
			response(false);
		} else {
			response(true);
		}
	});
}, 'Validation of {id} failed');

RefreshTokenSchema.path('clientId').validate(function (value, response) {
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

RefreshTokenSchema.path('userId').validate(function (value, response) {
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

module.exports = RefreshToken;
