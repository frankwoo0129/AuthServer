/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');
var Client = require('./client').Client;
//var ValidationError = require('mongoose').Error.ValidationError;

/*
 *	Main Key:
 *		imei
 *		serial_id
 *		device_type
 *		os
 */
var DeviceSchema = new mongoose.Schema({
	clientId: {
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
	serialId: {
		type: String,
		required: true
	},
	deviceType: {
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
		clientId: self.clientId,
		imei: self.imei,
		serialId: self.serialId,
		deviceType: self.deviceType,
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

DeviceSchema.path('clientId').validate(function (value, response) {
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

var getDevice = function (deviceId, callback) {
	var query = {
		id: deviceId
	};
	Device.findOne(query, {
		id: true,
		lang: true,
		imei: true,
		serialId: true,
		deviceType: true,
		os: true,
		version: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getDevice, query=' + JSON.stringify(query),
				message: 'No this device',
				status: 404
			});
		} else {
			callback(null, result);
		}
	});
};

var addDevice = function (config, clientId, callback) {
	var newDevice = new Device();
	newDevice.lang = config.lang;
	newDevice.imei = config.imei;
	newDevice.serialId = config.serialId;
	newDevice.deviceType = config.deviceType;
	newDevice.os = config.os;
	newDevice.version = config.version;
	newDevice.id = md5.md5sum(JSON.stringify(newDevice));
	newDevice.clientId = clientId;
		
	newDevice.save(function (err) {
		if (err) {
//				// TODO
//				if (err instanceof ValidationError) {
//					console.log(err);
//					var message = [];
//					if (err.errors) {
//						Object.keys(err.errors).forEach(function (key) {
//							message.push(String(err.errors[key]));
//						});
//						res.status(400).json({
//							message: message
//						});
//					} else {
//						res.status(400).json({
//							message: err.message
//						});
//					}
//				} else {
//					next(err);
//				}
			callback(err);
		} else {
			callback(null, {
				id: newDevice.id,
				lang: newDevice.lang,
				imei: newDevice.imei,
				serialId: newDevice.serialId,
				deviceType: newDevice.deviceType,
				os: newDevice.os,
				version: newDevice.version
			});
		}
	});
};

var deleteDevice = function (deviceId, callback) {
	var query = {
		id: deviceId
	};
	Device.findOneAndRemove(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when deleteDevice, query=' + JSON.stringify(query),
				message: 'No this app',
				status: 404
			});
		} else {
			callback(null, {
				id: result.id,
				lang: result.lang,
				imei: result.imei,
				serialId: result.serialId,
				deviceType: result.deviceType,
				os: result.os,
				version: result.version
			});
		}
	});
};

module.exports.Device = Device;
module.exports.getDevice = getDevice;
module.exports.addDevice = addDevice;
module.exports.deleteDevice = deleteDevice;
