/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var root = require('express').Router();
var User = require('../schema/addressbook/user');
var token = require('./token');

root.get('/', token.getToken, function (req, res, next) {
	var ret = {};
	if (typeof req.query.user === 'string') {
		User.getUserConfigure(req.query.user, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	} else if (typeof req.query.user === 'object') {
		async.map(req.query.user, User.getUserConfigure, function (err, results) {
			if (err) {
				next(err);
			} else {
				res.json(results);
			}
		});
	} else {
		next({
			message: 'no user',
			status: 400
		});
	}
});

root.post('/', function (req, res, next) {
	if (!req.accessToken) {
		next({
			debug: 'no access_token',
			message: 'invalid_grant',
			status: 401
		});
	} else {
		var config = {};
		config.email = req.body.email;
		config.mobile_phone = req.body.mobile_phone;
		config.work_phone = req.body.work_phone;
		User.setUserConfigure(req.user.user, config, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	}
});
