/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', function (err) {
	console.log(err);
	process.exit();
});

module.exports.App = require('./app');
module.exports.Device = require('./device');
module.exports.Client = require('./client');
module.exports.ClientToken = require('./clienttoken');
module.exports.AccessToken = require('./accesstoken');
module.exports.RefreshToken = require('./refreshtoken');

process.on('exit', function () {
	mongoose.disconnect(function () {
		console.log('close mongodb');
	});
});
