/*jslint node: true */
/*jslint es5: true */
'use strict';

var moment = require('moment');
var Client = require('../schema/oauth').Client;
var Device = require('../schema/oauth').Device;
var User = require('../schema/oauth').User;
var AccessToken = require('../schema/oauth').AccessToken;
var RefreshToken = require('../schema/oauth').RefreshToken;
//var GrantToken = require('../schema/oauth').GrantToken;
var md5sum = require('./util').md5sum;

module.exports.generateToken = function (type, req, callback) {
	var plain = {
		tokenType: type,
		createdAt: new Date()
	};
	callback(null, md5sum(JSON.stringify(plain)));
};

//Always Required
module.exports.getAccessToken = function (bearerToken, callback) {
	var query = {
		id: bearerToken
	};
	AccessToken.findOne(query, {
		userId: true,
		clientId: true,
		expires: true,
		"_id": false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else {
			callback(null, result);
		}
	});
};

module.exports.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
	var newAccessToken = new AccessToken();
	newAccessToken.id = accessToken;
	newAccessToken.clientId = clientId;
	newAccessToken.expires = expires;
	newAccessToken.userId = user.id;
	newAccessToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

module.exports.getClient = function (clientId, clientSecret, callback) {
	var query = {
		id: clientId
	};
	Client.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback(null);
		} else if (result.type === 'mobile') {
			query = {
				clientId: clientId,
				id: clientSecret
			};
			Device.findOne(query, function (err, result) {
				if (err) {
					callback(err);
				} else if (!result) {
					callback(null);
				} else {
					callback(null, {
						clientId: clientId,
						deviceId: clientSecret
					});
				}
			});
		} else if (result.type === 'web') {
			if (result.secret === clientSecret) {
				callback(null, {
					clientId: clientId,
					clientSecret: clientSecret
				});
			} else {
				callback({
					debug: 'secret is Not paired',
					message: 'invalid_client',
					status: 401
				});
			}
		} else {
			callback({
				debug: 'database error, no this type',
				message: 'invalid_client',
				status: 500
			});
		}
	});
};

module.exports.grantTypeAllowed = function (clientId, grantType, callback) {
	switch (grantType) {
	case 'grant_token':
	case 'refresh_token':
	case 'password':
		callback(null, true);
		break;
	case 'implicit':
	case 'authorization_code':
	case 'client_credentials':
		callback(null, false);
		break;
	default:
		callback({
			debug: 'no support this grant_type, ' + grantType,
			message: 'unsupported_grant_type',
			status: 400
		});
	}
};

//Required for authorization_code grant type
module.exports.getAuthCode = function (authCode, callback) {
	throw new Error('getAuthCode is NOT implement');
};

module.exports.saveAuthCode = function (authCode, clientId, clientSecret, expires, user, callback) {
	throw new Error('saveAuthCode is NOT implement');
};

// Required for password grant type
module.exports.getUser = function (username, password, callback) {
	var query = {
		id: username
	};
	User.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is NOT found when getUser, query=' + JSON.stringify(query),
				message: 'invalid_grant',
				status: 401
			});
		} else if (result.strategy) {
			var authenticate = require('../strategy/' + result.strategy).authenticate;
			authenticate(result.user, password, function (err, auth) {
				if (err) {
					callback(err);
				} else if (!auth) {
					callback({
						debug: 'password: ' + password,
						message: 'invalid_grant',
						status: 401
					});
				} else {
					callback(null, {
						id: result.id,
						user: result.user,
						org: result.org,
					});
				}
			});
		} else if (result.password !== password) {
			callback({
				debug: 'password typo: ' + password,
				message: 'invalid_grant',
				status: 401
			});
		} else if (result.changePassword === true) {
			callback({
				debug: 'Need to change password',
				message: 'Need to change password',
				status: 200,
				id: result.id
			});
		} else {
			callback(null, {
				id: result.id,
				user: result.user,
				org: result.org,
			});
		}
	});
};

// Required for refresh_token grant type
module.exports.getRefreshToken = function (refreshToken, callback) {
	var query = {
		id: refreshToken
	};
	RefreshToken.findOne(query, {
		userId: true,
		clientId: true,
		clientSecret: true,
		expires: true,
		"_id" : false
	}, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getRefreshToken, query=' + JSON.stringify(query),
				message: 'invalid_grant',
				status: 401
			});
		} else {
			callback(null, result);
		}
	});
};

module.exports.saveRefreshToken = function (refreshToken, clientId, expires, user, callback) {
	var newRefreshToken = new RefreshToken();
	newRefreshToken.id = refreshToken;
	newRefreshToken.clientId = clientId;
	newRefreshToken.expires = expires;
	newRefreshToken.userId = user.id;
	newRefreshToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

//Required for client_credentials grant type
//module.exports.getUserFromClient = function (clientId, clientSecret, callback) {
//	var query = {
//		clientId: clientId,
//		clientSecret: clientSecret
//	};
//	GrantToken.findOne(query, function (err, result) {
//		if (err) {
//			callback(err);
//		} else if (!result) {
//			callback({
//				debug: 'result is NOT found when getUserFromClient, query=' + JSON.stringify(query),
//				message: 'invalid_client',
//				status: 401
//			});
//		} else {
//			callback(null, {
//				id: result.userId
//			});
//		}
//	});
//};
//
//module.exports.getGrantToken = function (grantToken, callback) {
//	var query = {
//		id: grantToken
//	};
//	GrantToken.findOne(query, function (err, result) {
//		if (err) {
//			callback(err);
//		} else if (!result) {
//			callback({
//				debug: 'result is Not found when getGrantToken, query=' + JSON.stringify(query),
//				message: 'invalid_grant',
//				status: 401
//			});
//		} else {
//			var expires = moment(result.createdAt).add(result.expires, 'seconds').diff(moment(), 'seconds');
//			callback(null, {
//				userId: result.userId,
//				clientId: result.clientId,
//				clientSecret: result.clientSecret,
//				expires: expires
//			});
//		}
//	});
//};
//
//module.exports.saveGrantToken = function (grantToken, clientId, clientSecret, expires, user, callback) {
//	var newGrantToken = new GrantToken();
//	newGrantToken.id = grantToken;
//	newGrantToken.clientId = clientId;
//	newGrantToken.clientSecret = clientSecret;
//	newGrantToken.expires = expires;
//	newGrantToken.userId = user;
//	newGrantToken.save(function (err) {
//		if (err) {
//			callback(err);
//		} else {
//			callback();
//		}
//	});
//};
