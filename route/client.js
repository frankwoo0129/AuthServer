/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var Client = require('../schema/oauth').Client;

/**
 * @apiDefine ReturnClientInfo
 * @apiSuccess {String} id Client ID.
 * @apiSuccess {String} name Name.
 * @apiSuccess {String} type mobile, web or task.
 * @apiSuccess {String} os web, iOS or Android.
 * @apiSuccess {String} version client version.
 * @apiSuccess {Boolean} expired expired or not.
 */

/**
 * @api {get} /client Get Client List
 * @apiName getAllClient
 * @apiGroup Client
 *
 * @apiSuccess {Object[]} clients List of ACL.
 * @apiSuccess {String} clients.id Client ID.
 * @apiSuccess {String} clients.name Name.
 * @apiSuccess {String} clients.type mobile, web or task.
 * @apiSuccess {String} clients.os web, iOS or Android.
 * @apiSuccess {String} clients.version client version.
 * @apiSuccess {Boolean} clients.expired expired or not.
 *
 */
root.get('/client', function (req, res, next) {
	Client.getAllClient(function (err, results) {
		if (err) {
			next(err);
		} else {
			res.json(results);
		}
	});
});

/**
 * @api {get} /client/:clientId Get Client Info
 * @apiName getClient
 * @apiGroup Client
 *
 * @apiParam (Url Parameter) {String} clientId Client ID
 *
 * @apiUse ReturnClientInfo
 *
 * @apiUse UserError
 * @apiUse SystemError
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
root.get('/client/:clientId', function (req, res, next) {
	Client.getClient(req.params.clientId, function (err, client) {
		if (err) {
			next(err);
		} else {
			res.json(client);
		}
	});
});

/**
 * @api {post} /client New Client
 * @apiName addClient
 * @apiGroup Client
 *
 * @apiParam (Body Parameter) {String} name
 * @apiParam (Body Parameter) {String} type
 * @apiParam (Body Parameter) {String} os
 * @apiParam (Body Parameter) {String} version
 *
 * @apiUse ReturnClientInfo
 * @apiSuccess {String} [clientSecret] Client Secret.
 */
root.post('/client', function (req, res, next) {
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
		Client.addClient(req.body.name, req.body.type, req.body.os, req.body.version, function (err, client) {
			if (err) {
				next(err);
			} else {
				res.json(client);
			}
		});
	}
});

/**
 * @api {delete} /client/:clientId Delete Client
 * @apiName deleteClient
 * @apiGroup Client
 *
 * @apiParam (Url Parameter) {String} clientId
 */
root.delete('/client/:clientId', function (req, res, next) {
	Client.deleteClient(req.params.clientId, function (err, client) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

module.exports = root;
