/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var moment = require('moment');
var Client = require('../schema').Client;
var ClientToken = require('../schema').ClientToken;
var md5 = require('../lib/md5');
var rsa = require('../lib/rsa');
var randomPassword = require('../lib/util').randomString("abcdefghijklmnpqrstuwxyz123456789");

var getClientId = function (req, res, next) {
	if (!req.query.user) {
		next({
			message: 'No \'user\'',
			status: 400
		});
	} else if (!req.query.org) {
		next({
			message: 'No \'org\'',
			status: 400
		});
	} else {
		var query = {
			user: req.query.user,
			org: req.query.org
		};
		Client.findOne(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when getClientId, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				res.status(200).json({
					client_id: result.id,
					user: result.user,
					org: result.org
				});
			}
		});
	}
};

var getClient = function (req, res, next) {
	var query = {
		id: req.params.id
	};
	Client.findOne(query, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next({
				debug: 'result is Not found when getClient, query=' + JSON.stringify(query),
				message: 'No this user',
				status: 404
			});
		} else {
			res.status(200).json({
				client_id: result.id,
				user: result.user,
				org: result.org
			});
		}
	});
};

var addClient = function (req, res, next) {
	if (!req.body.user) {
		next({
			message: 'No \'user\'',
			status: 400
		});
	} else if (!req.body.org) {
		next({
			message: 'No \'org\'',
			status: 400
		});
	} else {
		var newClient = new Client();
		newClient.user = req.body.user;
		newClient.org = req.body.org;
		newClient.id = md5.md5sum(JSON.stringify(newClient));
		newClient.password = randomPassword(6);
		newClient.save(function (err) {
			if (err) {
				next(err);
			} else {
				res.status(200).json({
					client_id: newClient.id,
					user: newClient.user,
					org: newClient.org,
					passowrd: newClient.password
				});
			}
		});
	}
};

var deleteClient = function (req, res, next) {
	if (!req.body.client_id) {
		next({
			message: 'No \'client_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.body.client_id
		};
		Client.findOneAndRemove(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when deleteClient, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				res.status(200).json({
					client_id: result.id,
					user: result.user,
					org: result.org
				});
			}
		});
	}
};

var changePassword = function (req, res, next) {
	if (!req.body.password) {
		next({
			message: 'No \'password\'',
			status: 400
		});
	} else if (!req.body.newpassword) {
		next({
			message: 'No \'newpassword\'',
			status: 400
		});
	} else if (!req.body.client_id) {
		next({
			message: 'No \'client_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.body.client_id,
			password: req.body.password
		};
		Client.findOneAndUpdate(query, {
			$set: {
				password: req.body.newpassword,
				changePassword: false
			}
		}, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when changePassword, query=' + JSON.stringify(query),
					message: 'Auth Error',
					status: 401
				});
			} else {
				res.status(200).json({
					client_id: result.id
				});
			}
		});
	}
};

var resetPassword = function (req, res, next) {
	if (!req.body.client_id) {
		next({
			message: 'No client_id',
			status: 400
		});
	} else {
		var query = {id: req.body.client_id};
		Client.findOneAndUpdate(query, {
			$set: {
				password: randomPassword(6),
				changePassword: true
			}
		}, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when resetPassword, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				res.status(200).json({
					client_id: result.id,
					password: result.password
				});
			}
		});
	}
};



var encrypt = function (plain) {
	return rsa.encrypt(JSON.stringify(plain)).replace(/\+/g, '-').replace(/\//g, '_');
};

var decrypt = function (cipher) {
	return JSON.parse(rsa.decrypt(cipher.replace(/\-/g, '+').replace(/\_/g, '/')));
};

var getClientToken = function (req, res, next) {
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
	} else if (req.body.client_id) {
		query = {
			id: req.body.client_id,
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
	
	Client.findOne(query, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next({
				debug: 'result is NOT found when getClientToken, query=' + JSON.stringify(query),
				message: 'Auth Error',
				status: 401
			});
		} else if (result.changePassword === true) {
			res.status(200).json({
				message: 'Need to change password',
				client_id: result.id
			});
		} else {
			var clientToken = new ClientToken();
			clientToken.device_id = req.body.device_id;
			clientToken.client_id = result.id;
			clientToken.save(function (err) {
				if (err) {
					next(err);
				} else {
					try {
						// plain.length cannot be larger than 219(some number)
						var plain = {
								id: clientToken.id,
								client_id: clientToken.client_id,
								createdAt: clientToken.createdAt
							},
							token = encrypt(plain);
						res.status(200).json({
							client_id: clientToken.client_id,
							client_token: token
						});
					} catch (e) {
						next(e);
					}
				}
			});
		}
	});

};

var getClientConfigure = function (req, res, next) {
	if (!req.params.id) {
		next({
			message: 'No \'client_id\'',
			status: 400
		});
	} else {
		var query = {
			id: req.params.id
		};
		Client.findOne(query, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when getClientConfigure, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				res.status(200).json({
					client_id: result.id,
					user: result.user,
					org: result.org,
					domain: result.domain,
					email: result.email,
					mobile_phone: result.mobile_phone,
					work_phone: result.work_phone
				});
			}
		});
	}
};

var setClientConfigure = function (req, res, next) {
	if (!req.body.client_id) {
		next({
			message: 'No client_id',
			status: 400
		});
	} else {
		var query = {id: req.body.client_id},
			set = {},
			change = false;
		
		if (req.body.domain) {
			set.domain = req.body.domain;
			change = true;
		}
		if (req.body.email) {
			set.email = req.body.email;
			change = true;
		}
		if (req.body.mobile_phone) {
			set.modile_phone = req.body.mobile_phone;
			change = true;
		}
		if (req.body.work_phone) {
			set.work_phone = req.body.work_phone;
			change = true;
		}
		if (change !== true) {
			next({
				message: 'No change',
				status: 400
			});
			return;
		}
		
		Client.findOneAndUpdate(query, {
			$set: set
		}, function (err, result) {
			if (err) {
				next(err);
			} else if (!result) {
				next({
					debug: 'result is Not found when changeConfigure, query=' + JSON.stringify(query),
					message: 'No this user',
					status: 404
				});
			} else {
				res.status(200).json({
					client_id: result.id,
					user: result.user,
					org: result.org,
					domain: result.domain,
					email: result.email,
					mobile_phone: result.mobile_phone,
					work_phone: result.work_phone
				});
			}
		});
	}
};

module.exports.decrypt = decrypt;
module.exports.getClientToken = getClientToken;

module.exports.resetPassword = resetPassword;
module.exports.changePassword = changePassword;

module.exports.getClientId = getClientId;
module.exports.getClient = getClient;
module.exports.addClient = addClient;
module.exports.deleteClient = deleteClient;

module.exports.getClientConfigure = getClientConfigure;
module.exports.setClientConfigure = setClientConfigure;
