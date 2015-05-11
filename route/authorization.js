/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";
var oauth2 = require('../lib/oauth2');

var checkPassword = function (user, password, callback) {
	if (!user) {
		callback({
			debug: 'no user',
			message: 'invalid_request',
			status: 400
		});
	} else if (!password) {
		callback({
			debug: 'no password',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getUser(user, password, function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	}
};

var useGrantToken = function (req, res, next) {
	checkPassword(req.body.user, req.body.password, function (err) {
		if (err) {
			next(err);
		} else {
			var expires = 86400;
			oauth2.saveGrantToken(req.oauth.clientId, req.oauth.clientSecret, expires, req.body.user, function (err, grantToken) {
				if (err) {
					next(err);
				} else {
					res.status(200).json({
						grant_token: grantToken,
						expires_in: expires
					});
				}
			});
		}
	});
};

var usePassword = function (req, res, next) {
	checkPassword(req.body.user, req.body.password, function (err) {
		if (err) {
			next(err);
		} else {
			var expires = 3600;
			oauth2.saveAccessToken(req.oauth.clientId, req.oauth.clientSecret, expires, req.body.user, function (err, accessToken) {
				if (err) {
					next(err);
				} else {
					res.status(200).json({
						access_token: accessToken,
						token_type: 'Bearer',
						expires_in: expires
					});
				}
			});
		}
	});
};

var checkResponseType = function (req, res, next) {
	if (!req.body.response_type) {
		next({
			debug: 'no response_type',
			message: 'invalid_request',
			status: 400
		});
	} else if (req.body.response_type === 'grant_token') {
		useGrantToken(req, res, next);
	} else if (req.body.response_type === 'token') {
		usePassword(req, res, next);
	} else if (req.body.response_type === 'code') {
		next({
			debug: 'authorization_code is NOT supported',
			message: 'unsupported_response_type',
			status: 400
		});
	} else {
		next({
			debug: 'unsupported_response_type',
			message: 'unsupported_response_type',
			status: 400
		});
	}
};

module.exports = checkResponseType;
