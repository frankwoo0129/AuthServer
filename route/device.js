/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var Device = require('../schema/oauth').Device;

/**
 * @apiDefine ReturnDeviceInfo
 * @apiSuccess {String} id Device ID.
 * @apiSuccess {String} lang mobile lang.
 * @apiSuccess {String} imei mobile imei.
 * @apiSuccess {String} serialId
 * @apiSuccess {String} deviceType
 * @apiSuccess {String} os iOS or Android.
 * @apiSuccess {String} version os version.
 */

/**
 * @api {get} /device/:deviceId Get Device Info
 * @apiName getDevice
 * @apiGroup Device
 *
 * @apiParam (Url Parameter) {String} deviceId Device ID
 *
 * @apiUse ReturnDeviceInfo
 */
root.get('/device/:deviceId', function (req, res, next) {
	Device.getDevice(req.params.deviceId, function (err, device) {
		if (err) {
			next(err);
		} else {
			res.json(device);
		}
	});
});

/**
 * @api {post} /device New device
 * @apiName addDevice
 * @apiGroup Device
 *
 * @apiParam (Body Parameter) {String} lang="zh_tw" mobile lang.
 * @apiParam (Body Parameter) {String} imei mobile imei.
 * @apiParam (Body Parameter) {String} serialId
 * @apiParam (Body Parameter) {String} deviceType
 * @apiParam (Body Parameter) {String} os iOS or Android.
 * @apiParam (Body Parameter) {String} version os version.
 *
 * @apiUse ReturnDeviceInfo
 */
root.post('/device', function (req, res, next) {
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

/**
 * @api {delete} /device/:deviceId Delete Device
 * @apiName deleteDevice
 * @apiGroup Device
 *
 * @apiParam (Url Parameter) {String} deviceId Device ID
 */
root.delete('/device/:deviceId', function (req, res, next) {
	Device.deleteDevice(req.params.deviceId, function (err, device) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

module.exports = root;

