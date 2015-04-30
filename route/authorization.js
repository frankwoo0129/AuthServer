/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";
var User = require('../schema').User;
var GrantToken = require('../schema').GrantToken;
var rsa = require('../lib/rsa');

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

module.exports.decrypt = decrypt;
module.exports.getGrantToken = getGrantToken;
