/*jslint node: true */
/*jslint es5: true */
'use strict';

var moment = require('moment');
var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var GrantToken = require('../schema').GrantToken;
var Client = require('../schema').Client;
var Device = require('../schema').Device;
var User = require('../schema').User;
var md5 = require('./md5');

var generateToken = function (tokenType, createdAt) {
	var plain = {
		tokenType: tokenType,
		createdAt: createdAt
	};
	return md5.md5sum(JSON.stringify(plain));
};

//Always Required
module.exports.getAccessToken = function (bearerToken, callback) {
	var query = {
		id: bearerToken
	};
	AccessToken.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getAccessToken, query=' + JSON.stringify(query),
				message: 'invalid_token',
				status: 401
			});
		} else {
			var expires = moment(result.createdAt).add(result.expires, 'seconds').diff(moment(), 'seconds');
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: expires
			});
		}
	});
};

module.exports.saveAccessToken = function (clientId, clientSecret, expires, user, callback) {
	var newAccessToken = new AccessToken();
	newAccessToken.id = generateToken('access_token', newAccessToken.createdAt);
	newAccessToken.clientId = clientId;
	newAccessToken.clientSecret = clientSecret;
	newAccessToken.expires = expires;
	newAccessToken.userId = user;
	newAccessToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback(null, newAccessToken.id);
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
			callback({
				debug: 'result is Not found when getClient, query=' + JSON.stringify(query),
				message: 'invalid_client',
				status: 401
			});
		} else if (result.type === 'application_mobile') {
			query = {
				clientId: clientId,
				id: clientSecret
			};
			Device.findOne(query, function (err, result) {
				if (err) {
					callback(err);
				} else if (!result) {
					callback({
						debug: 'result is Not found when Device findOne, query=' + JSON.stringify(query),
						message: 'invalid_client',
						status: 401
					});
				} else {
					callback();
				}
			});
		} else if (result.type === 'application_web') {
			if (result.secret === clientSecret) {
				callback();
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
				status: 401
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
		id: username,
		password: password
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
		} else if (result.changePassword === true) {
			callback({
				debug: 'Need to change password',
				message: 'Need to change password',
				status: 200,
				id: result.id
			});
		} else {
			callback();
		}
	});
};

// Required for refresh_token grant type
module.exports.getRefreshToken = function (refreshToken, callback) {
	var query = {
		id: refreshToken
	};
	RefreshToken.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getRefreshToken, query=' + JSON.stringify(query),
				message: 'invalid_grant',
				status: 401
			});
		} else {
			var expires = moment(result.createdAt).add(result.expires, 'seconds').diff(moment(), 'seconds');
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: expires
			});
		}
	});
};

module.exports.saveRefreshToken = function (clientId, clientSecret, expires, user, callback) {
	var newRefreshToken = new RefreshToken();
	newRefreshToken.id = generateToken('refresh_token', newRefreshToken.createdAt);
	newRefreshToken.clientId = clientId;
	newRefreshToken.clientSecret = clientSecret;
	newRefreshToken.expires = expires;
	newRefreshToken.userId = user;
	newRefreshToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback(null, newRefreshToken.id);
		}
	});
};

//Required for client_credentials grant type
module.exports.getUserFromClient = function (clientId, clientSecret, callback) {
	var query = {
		clientId: clientId,
		clientSecret: clientSecret
	};
	GrantToken.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is NOT found when getUserFromClient, query=' + JSON.stringify(query),
				message: 'invalid_client',
				status: 401
			});
		} else {
			callback(null, {
				id: result.id,
				userId: result.userId
			});
		}
	});
};

module.exports.getGrantToken = function (grantToken, callback) {
	var query = {
		id: grantToken
	};
	GrantToken.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getGrantToken, query=' + JSON.stringify(query),
				message: 'invalid_grant',
				status: 401
			});
		} else {
			var expires = moment(result.createdAt).add(result.expires, 'seconds').diff(moment(), 'seconds');
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: expires
			});
		}
	});
};

module.exports.saveGrantToken = function (clientId, clientSecret, expires, user, callback) {
	var newGrantToken = new GrantToken();
	newGrantToken.id = generateToken('grant_token', newGrantToken.createdAt);
	newGrantToken.clientId = clientId;
	newGrantToken.clientSecret = clientSecret;
	newGrantToken.expires = expires;
	newGrantToken.userId = user;
	newGrantToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback(null, newGrantToken.id);
		}
	});
};
