/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var root = require('express').Router();
var basicAuth = require('basic-auth');
var User = require('../schema/oauth').User;
var oauth2 = require('../lib/oauth2');

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
		} else if (!accessToken) {
			next({
				debug: 'no this token',
				message: 'invalid_token',
				status: 401
			});
		} else {
			var expire = (accessToken.expires.getTime() - new Date().getTime()) / 1000;
			if (expire < 0) {
				next({
					debug: 'token expired',
					message: 'invalid_token',
					status: 401
				});
			} else {
				req.accessToken = accessToken;
				next();
			}
		}
	});
};

//var useGrantToken = function (req, res, next) {
//	if (!req.body.grant_token) {
//		next({
//			debug: 'no grant_token',
//			message: 'invalid_request',
//			status: 400
//		});
//	} else if (!req.body.userId) {
//		next({
//			debug: 'no userId',
//			message: 'invalid_request',
//			status: 400
//		});
//	} else {
//		oauth2.getGrantToken(req.body.grant_token, function (err, result) {
//			if (err) {
//				next(err);
//			} else {
//				if (result.clientId !== req.oauth.clientId) {
//					next({
//						debug: 'clientId is NOT paired',
//						message: 'invalid_grant',
//						status: 401
//					});
//				} else if (result.clientSecret !== req.oauth.clientSecret) {
//					next({
//						debug: 'clientSecret is NOT paired',
//						message: 'invalid_grant',
//						status: 401
//					});
//				} else if (result.userId !== req.body.userId) {
//					next({
//						debug: 'userId is NOT paired',
//						message: 'invalid_grant',
//						status: 401
//					});
//				} else {
//					req.oauth.userId = req.body.userId;
//					next();
//				}
//			}
//		});
//	}
//};

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
//			} else if (result.clientSecret !== req.oauth.clientSecret) {
//				next({
//					debug: 'refresh_token and clientSecret is NOT paired',
//					message: 'invalid_grant',
//					status: 401
//				});
			} else if (result.expires.getTime() < new Date().getTime()) {
				next({
					debug: 'refresh_token expired',
					message: 'invalid_grant',
					status: 401
				});
			} else {
				req.oauth.user = result.user;
				next();
			}
		});
	}
};

var usePassword = function (req, res, next) {
	if (!req.body.password) {
		return next({
			debug: 'no password',
			message: 'invalid_request',
			status: 400
		});
	} else if (req.body.userId) {
		oauth2.getUser(req.body.userId, req.body.password, function (err, user) {
			if (err) {
				next(err);
			} else {
				req.oauth.user = user;
				next();
			}
		});
	} else if (!req.body.user) {
		return next({
			debug: 'no user',
			message: 'invalid_request',
			status: 400
		});
	} else if (!req.body.org) {
		return next({
			debug: 'no org',
			message: 'invalid_request',
			status: 400
		});
	} else {
		User.getUserId(req.body.user, req.body.org, function (err, result) {
			if (err) {
				next(err);
			} else {
				var userId = result.id;
				oauth2.getUser(userId, req.body.password, function (err, user) {
					if (err) {
						next(err);
					} else {
						req.oauth.user = user;
						next();
					}
				});
			}
		});
	}
};

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

var checkGrantTypeAllowed = function (req, res, next) {
	if (!req.body.grant_type) {
		return next({
			debug: 'no grant_type',
			message: 'invalid_request',
			status: 400
		});
	}
	
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
};

var checkGrantType = function (req, res, next) {
	if (req.oauth.grant_type === 'password') {
		usePassword(req, res, next);
//	} else if (req.oauth.grant_type === 'grant_token') {
//		useGrantToken(req, res, next);
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
};

var sendAccessToken = function (req, res, next) {
	oauth2.generateToken('accessToken', req, function (err, id) {
		var date = new Date();
		date.setSeconds(date.getSeconds() + 3600);
		oauth2.saveAccessToken(id, req.oauth.clientId, date, req.oauth.user, function (err) {
			if (err) {
				next(err);
			} else {
				req.oauth.access_token = id;
				next();
			}
		});
	});
};

var sendRefreshToken = function (req, res, next) {
	if (req.oauth.grant_type === 'refresh_token') {
		next();
	} else {
		var date = new Date();
		date.setSeconds(date.getSeconds() + 86400);
		oauth2.generateToken('refreshToken', req, function (err, id) {
			oauth2.saveRefreshToken(id, req.oauth.clientId, date, req.oauth.user, function (err) {
				if (err) {
					next(err);
				} else {
					req.oauth.refresh_token = id;
					next();
				}
			});
		});
	}
};

var sendResponse = function (req, res, next) {
	var ret = {};
	
	if (req.oauth.refresh_token) {
		ret.refresh_token = req.oauth.refresh_token;
	}
	
	if (req.oauth.access_token) {
		ret.user = req.oauth.user;
		ret.access_token = req.oauth.access_token;
		ret.token_type = 'Bearer';
		ret.expires_in = 3600;
		res.json(ret);
	} else {
		next({
			debug: 'no access token',
			message: 'Server Error',
			status: 500
		});
	}
};

module.exports.checkClient = checkClient;
module.exports.getToken = checkAccessToken;
module.exports.postToGetToken = [checkClient, checkGrantTypeAllowed, checkGrantType, sendAccessToken, sendRefreshToken, sendResponse];
