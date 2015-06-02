/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var Client = require('../schema/client');

root.get('/', function (req, res, next) {
	Client.getAllClient(function (err, results) {
		if (err) {
			next(err);
		} else {
			res.json(results);
		}
	});
});

root.get('/:clientId', function (req, res, next) {
	Client.getClient(req.params.clientId, function (err, client) {
		if (err) {
			next(err);
		} else {
			res.json(client);
		}
	});
});

root.post('/', function (req, res, next) {
	if (!req.body.name) {
		return next({
			message: 'No name',
			status: 400
		});
	} else if (!req.body.type) {
		return next({
			message: 'No type',
			status: 400
		});
	} else if (!req.body.os) {
		return next({
			message: 'No os',
			status: 400
		});
	} else if (!req.body.version) {
		return next({
			message: 'No version',
			status: 400
		});
	} else {
		Client.addClient(req.body.name, req.body.type, req.body.os, req.body.version, 'test', function (err, user) {
			if (err) {
				next(err);
			} else {
				res.json(user);
			}
		});
	}
});

root.delete('/', function (req, res, next) {
	if (!req.body.clientId) {
		next({
			message: 'no clientId',
			status: 400
		});
	} else {
		Client.deleteClient(req.body.clientId, function (err, client) {
			if (err) {
				next(err);
			} else {
				res.json(client);
			}
		});
	}
});

module.exports = root;
