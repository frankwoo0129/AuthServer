/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var md5 = require('../lib/md5');
var App = require('../schema').App;

var getApp = function (req, res, next) {
	var query = {
		id: req.params.id
	};
	App.findOne(query, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next({
				debug: 'result is Not found when getApp, query=' + JSON.stringify(query),
				message: 'No this app',
				status: 404
			});
		} else {
			res.status(200).json({
				app_id: result.id,
				app_name: result.name,
				os: result.os,
				app_version: result.version,
				owner: result.owner
			});
		}
	});
};

var addApp = function (req, res, next) {
	if (!req.body.app_name) {
		next({
			message: 'No \'app_name\'',
			status: 400
		});
	} else if (!req.body.os) {
		next({
			message: 'No \'os\'',
			status: 400
		});
	} else if (!req.body.app_version) {
		next({
			message: 'No \'app_version\'',
			status: 400
		});
	} else if (!req.body.owner) {
		next({
			message: 'No \'owner\'',
			status: 400
		});
	} else if (!req.body.org) {
		next({
			message: 'No \'org\'',
			status: 400
		});
	} else {
		var newApp = new App();
		newApp.name = req.body.app_name;
		newApp.os = req.body.os;
		newApp.version = req.body.app_version;
		newApp.id = md5.md5sum(JSON.stringify(newApp));
		newApp.owner = {
			user: req.body.owner,
			org: req.body.org
		};
		
		newApp.save(function (err) {
			if (err) {
				next(err);
			} else {
				res.status(200).json({
					app_id: newApp.id,
					app_name: newApp.name,
					app_version: newApp.version,
					os: newApp.os,
					owner: newApp.owner
				});
			}
		});
	}
};

var deleteApp = function (req, res, next) {
	if (!req.body.app_id) {
		next({
			message: 'No \'app_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.body.app_id
		};
		App.findOneAndRemove(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when deleteApp, query=' + JSON.stringify(query),
					message: 'No this app',
					status: 404
				});
			} else {
				res.status(200).json({
					app_id: result.id,
					app_name: result.name,
					os: result.os,
					app_version: result.version,
					owner: result.owner
				});
			}
		});
	}
};

module.exports.getApp = getApp;
module.exports.addApp = addApp;
module.exports.deleteApp = deleteApp;