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
				message: 'Invalid token or expired',
				status: 401
			});
		} else {
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				expires: 3600
			});
		}
	});
};

var saveAccessToken = function (accessToken, clientId, expires, user, callback) {
	var newAccessToken = new AccessToken();
	newAccessToken.clientId = clientId;
	newAccessToken.userId = user;
	newAccessToken.id = accessToken;
	newAccessToken.createdAt.expires = expires;
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
				message: 'Invalid client',
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
	if (grantType === 'implicit') {
		callback(null, false);
	} else if (grantType === 'authorization_code') {
		callback(null, false);
	} else if (grantType === 'password') {
		callback(null, true);
	} else if (grantType === 'client_credentials') {
		callback(null, false);
	} else if (grantType === 'refresh_token') {
		callback(null, false);
	} else {
		callback({
			debug: 'Invalid grantType',
			message: 'Invalid grantType',
			status: 400
		});
	}
};

//Required for authorization_code grant type
var getAuthCode = function (authCode, callback) {
	throw new Error('getAuthCode is NOT implement');
};

var saveAuthCode = function (authCode, clientId, expires, user, callback) {
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
				message: 'Auth Error',
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
				message: 'Invalid token or expired',
				status: 401
			});
		} else {
			callback(null, {
				userId: result.userId,
				clientId: result.clientId,
				expires: 3600
			});
		}
	});
};

var saveRefreshToken = function (refreshToken, clientId, expires, user, callback) {
	var newRefreshToken = new RefreshToken();
	newRefreshToken.clientId = clientId;
	newRefreshToken.userId = user;
	newRefreshToken.id = refreshToken;
	newRefreshToken.createdAt.expires = expires;
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
				message: 'Auth Error',
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
