/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost:27017/oauth');

connection.on('error', function (err) {
	console.log(err);
	process.exit();
});

module.exports.Client = require('./client')(connection);
module.exports.Device = require('./device')(connection);
module.exports.User = require('./user')(connection);
module.exports.AccessToken = require('./accesstoken')(connection);
module.exports.RefreshToken = require('./refreshtoken')(connection);

process.on('exit', function () {
	connection.close(function () {
		console.log('close mongodb');
	});
});
