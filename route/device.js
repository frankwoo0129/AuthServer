/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var Device = require('../schema/device');

root.get('/:deviceId', function (req, res, next) {
	Device.getDevice(req.params.deviceId, function (err, device) {
		if (err) {
			next(err);
		} else {
			res.json(device);
		}
	});
});

root.post('/', function (req, res, next) {
	if (!req.body.imei) {
		return next({
			message: 'No imei',
			status: 400
		});
	} else if (!req.body.serial_id) {
		return next({
			message: 'No serial_id',
			status: 400
		});
	} else if (!req.body.device_type) {
		return next({
			message: 'No device_type',
			status: 400
		});
	} else if (!req.body.os) {
		return next({
			message: 'No os',
			status: 400
		});
	} else if (!req.body.version) {
		return next({
			message: 'No version',
			status: 400
		});
	} else if (!req.body.clientId) {
		return next({
			message: 'No clientId',
			status: 400
		});
	} else {
		var config = {};
		config.imei = req.body.imei;
		config.lang = req.body.lang || 'zh_tw';
		config.serialId = req.body.serial_id;
		config.deviceType = req.body.device_type;
		config.os = req.body.os;
		config.version = req.body.version;
		Device.addDevice(config, req.body.clientId, function (err, device) {
			if (err) {
				next(err);
			} else {
				res.json(device);
			}
		});
	}
});

root.delete('/', function (req, res, next) {
	if (!req.body.deviceId) {
		next({
			message: 'no deviceId',
			status: 400
		});
	} else {
		Device.deleteDevice(req.body.deviceId, function (err, device) {
			if (err) {
				next(err);
			} else {
				res.json(device);
			}
		});
	}
});

module.exports = root;

