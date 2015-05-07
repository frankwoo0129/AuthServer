/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var root = require('express').Router();
var Device = require('../schema').Device;
var User = require('../schema').User;
var getGrantToken = require('./authorization').getGrantToken;
var ClientToken = require('../schema').ClientToken;
var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var oauth2 = require('../lib/oauth2');

var checkAccessToken = function (req, res, next) {
	if (!req.headers.authorization) {
		next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	} else {
		var authorization = req.headers.authorization.match(/Bearer\s(\S+)/);
		if (authorization) {
			oauth2.getAccessToken(authorization[1], function (err, accessToken) {
				if (err) {
					next(err);
				} else if (accessToken.expires <= 0) {
					next({
						debug: 'token expired',
						message: 'invalid_token',
						status: 401
					});
				} else {
					res.status(200).json({
						userId: accessToken.userId,
						expires: accessToken.expires
					});
				}
			});
		} else {
			next({
				debug: 'authorization header error',
				message: 'invalid_token',
				status: 401
			});
		}
	}
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
						debug: 'grant_token and client is NOT paired',
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

var useGrantToken = function (req, res, next) {
	if (!req.body.userId) {
		next({
			debug: 'no userId',
			message: 'invalid_request',
			status: 400
		});
	} else if (req.body.userId !== req.oauth.userId) {
		next({
			debug: 'grant_token and user is NOT paired',
			message: 'invalid_grant',
			status: 401
		});
	} else {
		var accessToken,
			refreshToken,
			expires = 3600;
		oauth2.saveAccessToken(accessToken, req.oauth.clientId, req.oauth.clientSecret, expires, req.oauth.userId, function (err) {
			if (err) {
				next(err);
			} else {
				oauth2.saveRefreshToken(refreshToken, req.oauth.clientId, req.oauth.clientSecret, 86400, req.oauth.userId, function (err) {
					if (err) {
						next(err);
					} else {
						res.status(200).json({
							refresh_token: refreshToken,
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

var useAuthorizationCode = function (req, res, next) {
	next({
		debug: 'no AuthorizationCode grant',
		message: 'invalid_request',
		status: 400
	});
};

var useClientCredentials = function (req, res, next) {
	next({
		debug: 'no ClientCredentials grant',
		message: 'invalid_request',
		status: 400
	});
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
			} else if (result.clientId !== req.oauth.clientId) {
				next({
					debug: 'refresh_token and clientId is NOT paired',
					message: 'invalid_grant',
					status: 401
				});
			} else if (result.clientSecret !== req.oauth.clientSecret) {
				next({
					debug: 'refresh_token and clientSecret is NOT paired',
					message: 'invalid_grant',
					status: 401
				});
			} else if (result.userId !== req.oauth.userId) {
				next({
					debug: 'refresh_token and userId is NOT paired',
					message: 'invalid_grant',
					status: 401
				});
			} else if (result.expires <= 0) {
				next({
					debug: 'refresh_token expired',
					message: 'invalid_grant',
					status: 401
				});
			} else {
				var accessToken,
					expires = 3600;
				oauth2.saveAccessToken(accessToken, req.oauth.clientId, req.oauth.clientSecret, expires, req.oauth.userId, function (err) {
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

root.get('/', checkAccessToken);

root.post('/', [checkClient, checkGrantType, checkGrantToken, function (req, res, next) {
	if (req.oauth.grant_type === 'grant_token') {
		useGrantToken(req, res, next);
	} else if (req.oauth.grant_type === 'refresh_token') {
		useRefreshToken(req, res, next);
	} else if (req.oauth.grant_type === 'authorization_code') {
		useAuthorizationCode(req, res, next);
	} else if (req.oauth.grant_type === 'client_credentials') {
		useClientCredentials(req, res, next);
	} else {
		next({
			debug: 'grant_type is ' + req.oauth.grant_type,
			message: 'unsupported_grant_type',
			status: 400
		});
	}
}]);
