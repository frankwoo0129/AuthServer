/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', function (err) {
	console.log(err);
	process.exit();
});

module.exports.Client = require('./client').Cient;
module.exports.Device = require('./device').Device;
module.exports.User = require('./user').User;
module.exports.GrantToken = require('./granttoken');
module.exports.AccessToken = require('./accesstoken');
module.exports.RefreshToken = require('./refreshtoken');

process.on('exit', function () {
	mongoose.disconnect(function () {
		console.log('close mongodb');
	});
});
