/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var root = require('express').Router();
var User = require('../schema/user');

root.get('/profile', function (req, res, next) {
	var ret = {};
	if (typeof req.query.userId === 'string') {
		User.getUserConfigure(req.query.userId, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	} else if (typeof req.query.userId === 'object') {
		async.map(req.query.userId, User.getUserConfigure, function (err, results) {
			if (err) {
				next(err);
			} else {
				res.json(results);
			}
		});
	} else {
		next({
			message: 'no userId',
			status: 400
		});
	}
});

root.post('/profile', function (req, res, next) {
	if (!req.body.userId) {
		next({
			debug: 'no userId',
			message: 'invalid_request',
			status: 400
		});
	} else {
		var config = {};
		config.email = req.body.email;
		config.mobile_phone = req.body.mobile_phone;
		config.work_phone = req.body.work_phone;
		User.setUserConfigure(req.body.userId, config, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	}
});

root.get('/', function (req, res, next) {
	if (!req.query.user) {
		next({
			message: 'no user',
			status: 400
		});
	} else if (!req.query.org) {
		next({
			message: 'no org',
			status: 400
		});
	} else {
		User.getUserId(req.query.user, req.query.org, function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

root.get('/:userId', function (req, res, next) {
	User.getUser(req.params.userId, function (err, user) {
		if (err) {
			next(err);
		} else {
			res.json(user);
		}
	});
});

root.post('/', function (req, res, next) {
	if (!req.body.user) {
		next({
			message: 'no username',
			status: 400
		});
	} else if (!req.body.org) {
		next({
			message: 'no org',
			status: 400
		});
	} else {
		User.addUser(req.body.user, req.body.org, null, function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

root.delete('/', function (req, res, next) {
	if (!req.body.userId) {
		next({
			message: 'no userId',
			status: 400
		});
	} else {
		User.deleteUser(req.body.userId, function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

root.post('/resetpassword', function (req, res, next) {
	if (!req.body.userId) {
		next({
			message: 'no userId',
			status: 400
		});
	} else {
		User.resetPassword(req.body.userId, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	}
});

root.post('/changepassword', function (req, res, next) {
	if (!req.body.userId) {
		next({
			message: 'no userId',
			status: 400
		});
	} else if (!req.body.password) {
		next({
			message: 'no password',
			status: 400
		});
	} else if (!req.body.newpassword) {
		next({
			message: 'no newpassword',
			status: 400
		});
	} else {
		User.changePassword(req.body.userId, req.body.password, req.body.newpassword, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
			}
		});
	}
});

module.exports = root;
