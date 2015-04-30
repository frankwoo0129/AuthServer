/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var decryptClientToken = require('./account').decrypt;
var Device = require('../schema').Device;
var User = require('../schema').User;
var ClientToken = require('../schema').ClientToken;
var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var oauth2 = require('../lib/oauth2');

var checkClient =  function (req, res, next) {
	if (!req.headers.authorization) {
		next({
			message: 'unauthorized_client',
			status: 401
		});
	} else {
		var authorization = req.headers.authorization.split(' '),
			type = authorization[0],
			value = authorization[1],
			newValue;
		if (type.toLowerCase() === 'basic') {
			try {
				newValue = JSON.parse(value);
				oauth2.getClient(newValue.clientId, newValue.clientSecret, function (err) {
					if (err) {
						next(err);
					} else {
						next();
					}
				});
			} catch (err) {
				next({
					debug: err.stack,
					message: 'unauthorized_client',
					status: 401
				});
			}
		} else {
			next({
				debug: 'authorization type is ' + type,
				message: 'unauthorized_client',
				status: 401
			});
		}
	}
};

var check_client_token = function (req, res, next) {
	if (!req.body.client_token) {
		next({
			message: 'No \'client_token\'',
			status: 400
		});
	} else {
		try {
			var client = decryptClientToken(req.body.client_token);
			if (!client.id || !client.createdAt || !client.client_id) {
				next({
					debug: 'client_token decrypt ERROR',
					message: 'Invalid client_token',
					status: 401
				});
			} else {
				req.body.client_token = client;
				next();
			}
		} catch (err) {
			next({
				debug: err.stack,
				message: 'Invalid client_token',
				status: 401
			});
		}
	}
};

var check_access_token = function (req, res, next) {
	if (!req.body.client_id) {
		next({
			message: 'No \'client_id\'',
			status: 400
		});
	} else if (!req.body.device_id) {
		next({
			message: 'No \'device_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.body.client_token.id,
			client_id: req.body.client_id,
			device_id: req.body.device_id
		};
		ClientToken.findOne(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when check_access_token(ClientToken), query=' + JSON.stringify(query),
					message: 'Invalid clinet_token',
					status: 401
				});
			} else {
				var accessToken = new AccessToken(),
					refreshToken = new RefreshToken(),
					access,
					refresh;
				accessToken.app_id = req.body.app_id;
				accessToken.client_id = req.body.client_id;
				accessToken.save(function (err) {
					if (err) {
						next(err);
					} else {
						refreshToken.app_id = req.body.app_id;
						refreshToken.client_id = req.body.client_id;
						refreshToken.save(function (err) {
							if (err) {
								next(err);
							} else {
								res.status(200).json({
									access_token: accessToken.id,
									refresh_token: refreshToken.id
								});
							}
						});
					}
				});
			}
		});
	}
};

var check_refresh_token = function (req, res, next) {
	if (!req.body.refresh_token) {
		next({
			message: 'No \'refresh_token\'',
			status: 400
		});
	} else {
		var query_ClientToken = {
			id: req.body.client_token.id,
			client_id: req.body.client_token.client_id
		};
		ClientToken.findOne(query_ClientToken, function (err, result_client_token) {
			if (err) {
				next(err);
			} else if (!result_client_token) {
				next({
					debug: 'result is Not found when check_refresh_token(ClientToken), query=' + JSON.stringify(query_ClientToken),
					message: 'Invalid client_token',
					status: 401
				});
			} else {
				var query = {
					id: req.body.refresh_token,
					app_id: req.body.app_id,
					client_id: result_client_token.client_id
				};
				RefreshToken.findOne(query, function (err, result) {
					if (err) {
						next(err);
					} else if (!result) {
						next({
							debug: 'result is Not found when check_refresh_token(RefreshToken), query=' + JSON.stringify(query),
							message: 'Invalid refresh_token',
							status: 401
						});
					} else {
						var accessToken = new AccessToken();
						accessToken.client_id = result_client_token.client_id;
						accessToken.app_id = req.body.app_id;
						accessToken.save(function (err) {
							if (err) {
								next(err);
							} else {
								res.status(200).json({
									access_token: accessToken.id
								});
							}
						});
					}
				});
			}
		});
	}
};

var check_token_type = function (req, res, next) {
	if (!req.body.token_type) {
		next({
			message: 'No \'token_type\'',
			status: 400
		});
	} else if (req.body.token_type === 'refresh_token') {
		check_refresh_token(req, res, next);
	} else if (req.body.token_type === 'access_token') {
		check_access_token(req, res, next);
	} else {
		next({
			debug: 'token_type=' + req.body.token_type,
			message: 'No this token_type',
			status: 400
		});
	}
};
