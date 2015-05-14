/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var root = require('express').Router();
var basicAuth = require('basic-auth');
var oauth2 = require('../lib/oauth2');

var checkClient =  function (req, res, next) {
	var user = basicAuth(req);
	if (!user) {
		next({
			debug: 'authorization header error',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getClient(user.name, user.pass, function (err) {
			if (err) {
				next(err);
			} else {
				req.oauth = {
					clientId: user.name,
					clientSecret: user.pass
				};
				next();
			}
		});
	}
};

var checkAccessToken = function (req, res, next) {
	var headerToken = req.get('authorization'),
		matches;
	
	if (!headerToken) {
		return next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	}
	
	matches = headerToken.match(/Bearer\s(\S+)/);
	if (!matches) {
		return next({
			debug: 'authorization header error',
			message: 'invalid_token',
			status: 401
		});
	}
	
	oauth2.getAccessToken(matches[1], function (err, accessToken) {
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
				user: accessToken.userId,
				expires: accessToken.expires
			});
		}
	});
};

var checkGrantType = function (req, res, next) {
	if (!req.body.grant_type) {
		return next({
			debug: 'no grant_type',
			message: 'invalid_request',
			status: 400
		});
	}
	
	req.oauth.grant_type = req.body.grant_type;
	oauth2.grantTypeAllowed(req.oauth.clientId, req.oauth.grant_type, function (err, allow) {
		if (err) {
			next(err);
		} else if (!allow) {
			next({
				debug: 'grant_type is ' + req.oauth.grant_type,
				message: 'unsupported_grant_type',
				status: 400
			});
		} else {
			next();
		}
	});
};

var useGrantToken = function (req, res, next) {
	if (!req.body.grant_token) {
		next({
			debug: 'no grant_token',
			message: 'invalid_request',
			status: 400
		});
	} else if (!req.body.user) {
		next({
			debug: 'no user',
			message: 'invalid_request',
			status: 400
		});
	} else {
		oauth2.getGrantToken(req.body.grant_token, function (err, result) {
			if (err) {
				next(err);
			} else {
				if (result.clientId !== req.oauth.clientId) {
					next({
						debug: 'clientId is NOT paired',
						message: 'invalid_grant',
						status: 401
					});
				} else if (result.clientSecret !== req.oauth.clientSecret) {
					next({
						debug: 'clientSecret is NOT paired',
						message: 'invalid_grant',
						status: 401
					});
				} else if (result.userId !== req.body.user) {
					next({
						debug: 'userId is NOT paired',
						message: 'invalid_grant',
						status: 401
					});
				} else {
					var expires = 3600,
						ret = {};
					oauth2.saveAccessToken(req.oauth.clientId, req.oauth.clientSecret, expires, req.body.user, function (err, accessToken) {
						if (err) {
							next(err);
						} else {
							ret.access_token = accessToken;
							ret.token_type = 'Bearer';
							ret.expires_in = expires;
							oauth2.saveRefreshToken(req.oauth.clientId, req.oauth.clientSecret, 86400, req.body.user, function (err, refreshToken) {
								if (err) {
									ret.debug = 'saveRefreshToken error, ' + err;
									res.status(200).json(ret);
								} else {
									ret.refresh_token = refreshToken;
									res.status(200).json(ret);
								}
							});
						}
					});
				}
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
			} else if (result.expires <= 0) {
				next({
					debug: 'refresh_token expired',
					message: 'invalid_grant',
					status: 401
				});
			} else {
				var expires = 3600;
				oauth2.saveAccessToken(result.clientId, result.clientSecret, expires, result.userId, function (err, accessToken) {
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
		oauth2.getUser(req.body.user, req.body.password, function (err, result) {
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
	}
};

module.exports.getToken = checkAccessToken;

module.exports.postToGetToken = [checkClient, checkGrantType, function (req, res, next) {
	if (req.oauth.grant_type === 'password') {
		usePassword(req, res, next);
	} else if (req.oauth.grant_type === 'grant_token') {
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
}];
