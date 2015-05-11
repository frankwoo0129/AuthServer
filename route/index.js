/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var token = require('./token');
var auth = require('./authorization');
var User = require('../schema/user');

var checkClient =  function (req, res, next) {
	if (!req.headers.authorization) {
		next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	} else {
		var newValue = req.headers.authorization.match(/Basic\s(\S+)/),
			auth;
		if (newValue) {
			try {
				auth = JSON.parse(new Buffer(newValue[1], 'base64'));
				if (!auth.clientId) {
					next({
						debug: 'authotizarion header error',
						message: 'invalid_client',
						status: 401
					});
				} else {
					oauth2.getClient(auth.clientId, auth.clientSecret, function (err) {
						if (err) {
							next(err);
						} else {
							req.oauth = {
								clientId: auth.clientId,
								clientSecret: auth.clientSecret
							};
							next();
						}
					});
				}
			} catch (err) {
				next({
					debug: err.message,
					message: 'invalid_client',
					status: 401
				});
			}
		} else {
			next({
				debug: 'authorization header error',
				message: 'invalid_client',
				status: 401
			});
		}
	}
};

root.post('/auth', checkClient, auth);
root.get('/token', token.getToken);
root.post('/token', checkClient, token.postToGetToken);

root.get('/', function (req, res, next) {
	if (!req.query.username) {
		next({
			message: 'no username',
			status: 400
		});
	} else if (!req.query.org) {
		next({
			message: 'no org',
			status: 400
		});
	} else {
		User.getUserId(req.query.username, req.query.org, function (err, user) {
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
	if (!req.body.username) {
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
		User.addUser(req.body.username, req.body.org, null, function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

root.delete('/', function (req, res, next) {
	if (!req.body.user) {
		next({
			message: 'no user',
			status: 400
		});
	} else {
		User.deleteUser(req.body.user, function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

module.exports = root;
