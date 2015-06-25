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
root.post('/oauth/token', token.postToGetToken);
root.use('/account', account);
root.use('/device', device);
root.use('/client', client);
root.use('/acl', acl);

module.exports = root;
