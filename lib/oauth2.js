/*jslint node: true */
/*jslint es5: true */
'use strict';

var AccessToken = require('../schema').AccessToken;
var RefreshToken = require('../schema').RefreshToken;
var GrantToken = require('../schema').GrantToken;
var Device = require('../schema').Device;
var User = require('../schema').User;

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
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: 3600
			});
		}
	});
};

var saveAccessToken = function (accessToken, clientId, clientSecret, expires, user, callback) {
	var newAccessToken = new AccessToken();
	newAccessToken.id = accessToken;
	newAccessToken.clientId = clientId;
	newAccessToken.clientSecret = clientSecret;
	newAccessToken.createdAt.expires = expires;
	newAccessToken.userId = user;
	newAccessToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback();
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

//implicit
//authorization_code
//password
//client_credentials
//refresh_token
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
			callback(null, {
				id: result.id
			});
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
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: 3600
			});
		}
	});
};

var saveRefreshToken = function (refreshToken, clientId, clientSecret, expires, user, callback) {
	var newRefreshToken = new RefreshToken();
	newRefreshToken.id = refreshToken;
	newRefreshToken.clientId = clientId;
	newRefreshToken.clientSecret = clientSecret;
	newRefreshToken.createdAt.expires = expires;
	newRefreshToken.userId = user;
	newRefreshToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback();
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
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				clientSecret: result.clientSecret,
				expires: 3600
			});
		}
	});
};

var saveGrantToken = function (grantToken, clientId, clientSecret, expires, user, callback) {
	var newGrantToken = new GrantToken();
	newGrantToken.id = grantToken;
	newGrantToken.clientId = clientId;
	newGrantToken.clientSecret = clientSecret;
	newGrantToken.createdAt.expires = expires;
	newGrantToken.userId = user;
	newGrantToken.save(function (err) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};
