/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var account = require('./account');
var token = require('./token');
var device = require('./device');
var client = require('./client');
var acl = require('./accesscontrol');
var profile = require('./profile');

/**
 * @api {get} /oauth/token Check Access Token
 * @apiName CheckAccessToken
 * @apiGroup OAuth
 *
 * @apiHeader {String} authorization Access Token.
 *
 * @apiSuccess {Object} user User information.
 * @apiSuccess {Number} expires  Expired time.
 */
root.get('/oauth/token', token.getToken, function (req, res, next) {
	if (req.accessToken) {
		var expire = (req.accessToken.expires.getTime() - new Date().getTime()) / 1000;
		res.status(200).json({
			user: req.accessToken.user,
			expires: expire
		});
	} else {
		return next({
			message: 'invalid_grant',
			status: 401
		});
	}
});

/**
 * @api {post} /oauth/token Get Access Token
 * @apiName GetAccessToken
 * @apiGroup OAuth
 *
 * @apiHeader {String} authorization Basic authorization with clientId and clientSecret
 *
 * @apiSuccess {String} access_token Access Token
 * @apiSuccess {String} refresh_token Refresh Token.
 * @apiSuccess {Object} user User information.
 * @apiSuccess {String} token_type Always 'Bearer'.
 * @apiSuccess {Number} expires  Expired time.
 */
root.post('/oauth/token', token.postToGetToken);
root.use('/account/profile', profile);
root.use('/account', account);
root.use('/device', device);
root.use('/client', client);
root.use('/acl', acl);

module.exports = root;
