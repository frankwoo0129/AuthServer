/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');
var Client = require('./client');
var Device = require('./device');
var randomString = require('../lib/util').randomString("abcdefghijklmnopqrstuwxyz0123456789", 32);

/*
 *	Main Key:
 *		device_id
 *		client_id
 */
var ClientTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		default: randomString
	},
	device_id: {
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
		expires: 60 * 60 * 24 * 30
	}
});

var ClientToken = mongoose.model('ClientToken', ClientTokenSchema);

ClientTokenSchema.path('device_id').validate(function (value, response) {
	Device.findOne({
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
}, 'Validation of {device_id} failed');

ClientTokenSchema.path('client_id').validate(function (value, response) {
	var self = this;
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

ClientTokenSchema.pre('save', function (next) {
	var self = this;
	ClientToken.remove({
		device_id: self.device_id,
		client_id: self.client_id
	}, function (err, result) {
		if (err) {
			next(err);
		} else {
			next();
		}
	});
});

module.exports = ClientToken;
