/*jslint node: true */
/*jslint es5: true */
'use strict';

var moment = require('moment');
var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var GrantToken = require('../schema').GrantToken;
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
var getAccessToken = function (bearerToken, callback) {
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

var saveAccessToken = function (clientId, clientSecret, expires, user, callback) {
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

var getClient = function (clientId, clientSecret, callback) {
	var query = {
		clientId: clientId,
		id: clientSecret
	};
	Device.findOne(query, function (err, result) {
		if (err) {
			callback(err);
		} else if (!result) {
			callback({
				debug: 'result is Not found when getClient, query=' + JSON.stringify(query),
				message: 'invalid_client',
				status: 401
			});
		} else {
			callback();
		}
	});
};

var grantTypeAllowed = function (clientId, grantType, callback) {
	switch (grantType) {
	case 'password':
		callback(null, true);
		break;
	case 'implicit':
	case 'authorization_code':
	case 'client_credentials':
	case 'refresh_token':
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
var getAuthCode = function (authCode, callback) {
	throw new Error('getAuthCode is NOT implement');
};

var saveAuthCode = function (authCode, clientId, clientSecret, expires, user, callback) {
	throw new Error('saveAuthCode is NOT implement');
};

// Required for password grant type
var getUser = function (username, password, callback) {
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
var getRefreshToken = function (refreshToken, callback) {
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

var saveRefreshToken = function (clientId, clientSecret, expires, user, callback) {
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
var getUserFromClient = function (clientId, clientSecret, callback) {
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

var getGrantToken = function (grantToken, callback) {
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

var saveGrantToken = function (clientId, clientSecret, expires, user, callback) {
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
