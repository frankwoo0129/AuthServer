/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var token = require('./token');

root.get('/token', token.getToken);
root.post('/token', token.postToGetToken);

root.use(function (err, req, res, next) {
	if (err.status) {
		res.status(err.status).json({
			message: err.message,
			debug: err.debug
		});
	} else {
		console.log(err.stack);
		res.status(500).json({
			debug: err.message,
			message: 'Server Error'
		});
	}
});

module.exports = root;
