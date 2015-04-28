/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var Client = require('./client');
var App = require('./app');
var randomString = require('../lib/util').randomString("abcdefghijklmnopqrstuwxyz0123456789", 32);

var RefreshTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		default: randomString
	},
	app_id: {
		type: String,
		required: true
	},
	client_id: {
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

RefreshTokenSchema.path('client_id').validate(function (value, response) {
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
}, 'Validation of {client_id} failed');

RefreshTokenSchema.path('app_id').validate(function (value, response) {
	App.findOne({
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
}, 'Validation of {app_id} failed');

module.exports = RefreshToken;
