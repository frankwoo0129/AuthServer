/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var root = require('express').Router();
var User = require('../schema/oauth').User;

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
			message: 'no user',
			status: 400
		});
	} else if (!req.body.org) {
		next({
			message: 'no org',
			status: 400
		});
	} else {
		User.addUser(req.body.user, req.body.org, function (err, user) {
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
