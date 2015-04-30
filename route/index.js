/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var app = require('./app');
var device = require('./device');
var token = require('./token');
var account = require('./account');

root.get('/auth/app/:id', app.getApp);
root.post('/auth/app', app.addApp);
root.delete('/auth/app', app.deleteApp);

root.get('/auth/device/:id', device.getDevice);
root.post('/auth/device', device.addDevice);
root.delete('/auth/device', device.deleteDevice);

root.get('/account', account.getClientId);
root.get('/account/:id', account.getClient);
root.post('/account', account.addClient);
root.delete('/account', account.deleteClient);

root.post('/account/login', account.getClientToken);
root.post('/account/changepassword', account.changePassword);
root.post('/account/resetpassword', account.resetPassword);

root.get('/account/configure', account.getClientConfigure);
root.post('/account/configure', account.setClientConfigure);

root.get('/auth/token', token.getClient);
root.post('/auth/token', token.getAccessToken);

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
