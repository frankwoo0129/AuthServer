/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var Device = require('../schema').Device;
var User = require('../schema').User;
var getGrantToken = require('./authorization').getGrantToken;
var ClientToken = require('../schema').ClientToken;
var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var oauth2 = require('../lib/oauth2');

var checkAccessToken = function (req, res, next) {
	
};

var checkClient =  function (req, res, next) {
	if (!req.headers.authorization) {
		next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	} else {
		var authorization = req.headers.authorization.match(/Basic\s(\S+)/),
			newValue;
		if (authorization) {
			try {
				newValue = JSON.parse(authorization[1]);
				oauth2.getClient(newValue.clientId, newValue.clientSecret, function (err) {
					if (err) {
						next(err);
					} else {
						req.oauth = {
							clientId: newValue.clientId,
							clientSecret: newValue.clientSecret
						};
						next();
					}
				});
			} catch (err) {
				next({
					debug: err.stack,
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

var checkGrantType = function (req, res, next) {
	if (!req.body.grant_type) {
		next({
			debug: 'no grant_type',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.grantTypeAllowed(req.oauth.clientId, req.body.grant_type, function (err, allow) {
			if (err) {
				next(err);
			} else if (!allow) {
				next({
					debug: 'grant_type is ' + req.body.grant_type,
					message: 'unsupported_grant_type',
					status: 400
				});
			} else {
				req.oauth.grant_type = req.body.grant_type;
				next();
			}
		});
	}
};

// Grant Type
var usePassword = function (req, res, next) {
	if (!req.body.user) {
		next({
			debug: 'no user',
			message: 'invalid_request',
			status: 400
		});
	} else if (!req.body.password) {
		next({
			debug: 'no password',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getUser(req.body.user, req.body.password, function (err) {
			if (err) {
				next(err);
			} else {
				req.oauth.userId = req.body.user;
				next();
			}
		});
	}
};

var checkGrantToken = function (req, res, next) {
	if (!req.body.grant_token) {
		next({
			debug: 'no grant_token',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getGrantToken(req.body.grant_token, function (err, result) {
			if (err) {
				next(err);
			} else {
				if (result.clientId !== req.oauth.clientId && result.clientSecret !== req.oauth.clientSecret) {
					next({
						message: 'invalid_grant',
						status: 401
					});
				} else {
					req.oauth.userId = result.userId;
					next();
				}
			}
		});
	}
};

var useAuthorizationCode = function (req, res, next) {

};

var useClientCredentials = function (req, res, next) {

};

var useRefreshToken = function (req, res, next) {
	if (!req.body.refresh_token) {
		next({
			debug: 'no refesh_token',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getRefreshToken(req.body.refresh_token, function (err, result) {
			if (err) {
				next(err);
			} else if (result.clientId !== req.oauth.clientId || result.clientSecret !== req.oauth.clientSecret) {
				next({
					debug: 'refresh_token and client is NOT paired',
					message: 'invalid_grant',
					status: 401
				});
			} else {
				var accessToken,
					expires;
				oauth2.saveAccessToken(accessToken, result.clientId, result.clientSecret, expires, result.userId, function (err) {
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
	}
};




