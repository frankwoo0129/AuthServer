/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";
var User = require('../schema').User;
var GrantToken = require('../schema').GrantToken;
var rsa = require('../lib/rsa');
var oauth2 = require('../lib/oauth2');

var encrypt = function (plain) {
	return rsa.encrypt(JSON.stringify(plain)).replace(/\+/g, '-').replace(/\//g, '_');
};

var decrypt = function (cipher) {
	return JSON.parse(rsa.decrypt(cipher.replace(/\-/g, '+').replace(/\_/g, '/')));
};

var getGrantToken = function (req, res, next) {
	var query;
	if (!req.body.password) {
		next({
			message: 'No \'password\'',
			status: 400
		});
		return;
	} else if (!req.body.device_id) {
		next({
			message: 'No \'device_id\'',
			status: 400
		});
		return;
	} else if (req.body.user_id) {
		query = {
			id: req.body.user_id,
			password: req.body.password
		};
	} else if (!req.body.user) {
		next({
			message: 'No \'user\'',
			status: 400
		});
		return;
	} else if (!req.body.org) {
		next({
			message: 'No \'org\'',
			status: 400
		});
		return;
	} else {
		query = {
			user: req.body.user,
			org: req.body.org,
			password: req.body.password
		};
	}
	
	User.findOne(query, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next({
				debug: 'result is NOT found when getGrantToken, query=' + JSON.stringify(query),
				message: 'Auth Error',
				status: 401
			});
		} else if (result.changePassword === true) {
			res.status(200).json({
				message: 'Need to change password',
				user_id: result.id
			});
		} else {
			var grantToken = new GrantToken();
			grantToken.device_id = req.body.device_id;
			grantToken.user_id = result.id;
			grantToken.save(function (err) {
				if (err) {
					next(err);
				} else {
					try {
						// plain.length cannot be larger than 219(some number)
						var plain = {
								id: grantToken.id,
								user_id: grantToken.user_id,
								createdAt: grantToken.createdAt
							},
							token = encrypt(plain);
						res.status(200).json({
							grant_token: token
						});
					} catch (e) {
						next(e);
					}
				}
			});
		}
	});

};

var useGrantToken = function (req, res, next) {
	
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
				var accessToken,
					expires = 3600;
				oauth2.saveAccessToken(accessToken, req.oauth.clientId, req.oauth.clientSecret, expires, req.body.user, function (err) {
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
			message: 'authorization_code is NOT supported',
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
