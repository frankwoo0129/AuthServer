/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var account = require('./account');
var token = require('./token');
var auth = require('./authorization');
var device = require('./device');
var client = require('./client');

var checkClient =  function (req, res, next) {
	var headerToken = req.get('authorization'),
		matches;
	if (!headerToken) {
		return next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	}
	
	matches = headerToken.match(/Basic\s(\S+)/);
	if (!matches) {
		return next({
			debug: 'authorization header error',
			message: 'invalid_client',
			status: 401
		});
	}
		
	try {
		headerToken = JSON.parse(new Buffer(matches[1], 'base64'));
	} catch (err) {
		return next({
			debug: err.message,
			message: 'invalid_client',
			status: 401
		});
	}
	
	if (!headerToken.clientId) {
		return next({
			debug: 'authotizarion header error',
			message: 'invalid_client',
			status: 401
		});
	} else {
		oauth2.getClient(headerToken.clientId, headerToken.clientSecret, function (err) {
			if (err) {
				next(err);
			} else {
				req.oauth = {
					clientId: headerToken.clientId,
					clientSecret: headerToken.clientSecret
				};
				next();
			}
		});
	}
};

root.post('/auth', checkClient, auth);
root.get('/token', token.getToken);
root.post('/token', checkClient, token.postToGetToken);
root.use('/account', account);
root.use('/device', device);
root.use('/client', client);

module.exports = root;
