/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var md5 = require('../lib/md5');
var Device = require('../schema').Device;
var ValidationError = require('mongoose').Error.ValidationError;

var getDevice = function (req, res, next) {
	var query = {
		id: req.params.id
	};
	Device.findOne(query, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next({
				debug: 'result is Not found when getDevice, query=' + JSON.stringify(query),
				message: 'No this device',
				status: 404
			});
		} else {
			res.status(200).json({
				device_id: result.id,
				lang: result.lang,
				imei: result.imei,
				serial_id: result.serial_id,
				device_type: result.device_type,
				os: result.os,
				version: result.version
			});
		}
	});
};

var addDevice = function (req, res, next) {
	if (!req.body.imei) {
		next({
			message: 'No \'imei\'',
			status: 400
		});
	} else if (!req.body.lang) {
		/*lang default value = 'zh_tw'*/
		req.body.lang = 'zh_tw';
	} else if (!req.body.serial_id) {
		next({
			message: 'No \'serial_id\'',
			status: 400
		});
	} else if (!req.body.device_type) {
		next({
			message: 'No \'device_type\'',
			status: 400
		});
	} else if (!req.body.os) {
		next({
			message: 'No \'os\'',
			status: 400
		});
	} else if (!req.body.version) {
		next({
			message: 'No \'version\'',
			status: 400
		});
	} else if (!req.body.app_id) {
		next({
			message: 'No \'app_id\'',
			status: 400
		});
	} else {
		var newDevice = new Device();
		newDevice.lang = req.body.lang;
		newDevice.imei = req.body.imei;
		newDevice.serial_id = req.body.serial_id;
		newDevice.device_type = req.body.device_type;
		newDevice.os = req.body.os;
		newDevice.version = req.body.version;
		newDevice.id = md5.md5sum(JSON.stringify(newDevice));
		newDevice.app_id = req.body.app_id;
		
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
				next(err);
			} else {
				res.status(200).json({
					device_id: newDevice.id,
					lang: newDevice.lang,
					imei: newDevice.imei,
					serial_id: newDevice.serial_id,
					device_type: newDevice.device_type,
					os: newDevice.os,
					version: newDevice.version
				});
			}
		});
	}
};

var deleteDevice = function (req, res, next) {
	if (!req.body.device_id) {
		next({
			message: 'No \'device_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.body.device_id
		};
		Device.findOneAndRemove(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when deleteDevice, query=' + JSON.stringify(query),
					message: 'No this app',
					status: 404
				});
			} else {
				res.status(200).json({
					device_id: result.id,
					imei: result.imei,
					serial_id: result.serial_id,
					device_type: result.device_type,
					os: result.os,
					version: result.version
				});
			}
		});
	}
};

module.exports.getDevice = getDevice;
module.exports.addDevice = addDevice;
module.exports.deleteDevice = deleteDevice;