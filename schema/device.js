/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var App = require('./app');

/*
 *	Main Key:
 *		imei
 *		serial_id
 *		device_type
 *		os
 */
var DeviceSchema = new mongoose.Schema({
	app_id: {
		type: String,
		required: true
	},
	id: {
		type: String,
		required: true
	},
	lang: {
		type: String,
		default: 'zh_tw'
	},
	imei: {
		type: String,
		required: true
	},
	serial_id: {
		type: String,
		required: true
	},
	device_type: {
		type: String,
		required: true
	},
	os: {
		type: String,
		required: true
	},
	version: {
		type: String,
		required: true
	},
	expired: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

var Device = mongoose.model('Device', DeviceSchema);

DeviceSchema.pre('save', function (next) {
	var self = this;
	Device.remove({
		app_id: self.app_id,
		imei: self.imei,
		serial_id: self.serial_id,
		device_type: self.device_type,
		os: self.os,
		version: self.version
	}, function (err, result) {
		if (err) {
			next(err);
		} else {
			next();
		}
	});
});

DeviceSchema.path('id').validate(function (value, response) {
	var self = this;
	Device.findOne({
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

DeviceSchema.path('app_id').validate(function (value, response) {
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

module.exports = Device;
