/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost:27017/test');
var oauthConnection = mongoose.createConnection('mongodb://localhost:27017/token');
connection.on('error', function (err) {
    console.log(err);
    process.exit();
});

module.exports.Client = require('./client')(connection);
module.exports.Device = require('./device')(connection);
module.exports.User = require('./user')(connection);
module.exports.AccessToken = require('./accesstoken')(oauthConnection);
module.exports.RefreshToken = require('./refreshtoken')(oauthConnection);
module.exports.ACL = require('./acl')(connection);
module.exports.ACLEntry = require('./aclentry')(connection);

process.on('exit', function () {
    connection.close(function () {
        console.log('Close oauth mongodb connection');
    });
});
